import { query } from "../utils/db.js";

/* GET /api/news - Latest 50 non-archived articles */
export const getLatest = async (_req, res) => {
  try {
    const limit = parseInt(_req.query.limit) || 50;
    const category = _req.query.category; // optional

    let baseQuery = `
      SELECT
        id,
        title,
        summary AS description,
        summary,
        link,
        image_url,
        category,
        created_at
      FROM news_articles
      WHERE is_archived = FALSE
    `;

    const values = [];

    if (category) {
      baseQuery += ` AND category @> ARRAY[$1]::text[]`;
      values.push(category);
    }

    baseQuery += ` ORDER BY created_at DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const { rows } = await query(baseQuery, values);

    res.json(rows);
  } catch (e) {
    console.error("getLatest error", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* GET /api/news/:id - Single article by ID */
export const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query(
      `SELECT
        id,
        title,
        summary AS description,
        summary,
        link,
        image_url,
        category,
        created_at
      FROM news_articles
      WHERE id = $1
      LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error("getById error", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* GET /api/news/category/:category - Articles by category (with optional ?source=rss/api) */
export const getByCategory = async (req, res) => {
  const cat = req.params.category;
  const source = req.query.source; // optional query param

  try {
    let baseQuery = `
      SELECT
        id,
        title,
        summary AS description,
        summary,
        link,
        image_url,
        category,
        created_at
      FROM news_articles
      WHERE is_archived = FALSE
        AND category @> ARRAY[$1]::text[]
    `;

    const values = [cat];

    if (source) {
      baseQuery += ` AND source_type = $2`; // assuming you store 'rss' or 'api' in source_type
      values.push(source);
    }

    baseQuery += ` ORDER BY created_at DESC LIMIT 50`;

    const { rows } = await query(baseQuery, values);
    res.json(rows);
  } catch (e) {
    console.error("getByCategory error", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* GET /api/news/search?q=keyword - Search articles */

export const searchNews = async (req, res) => {
  console.log("🔍 Search endpoint hit with query:", req.query.q);

  const q = (req.query.q || "").trim().toLowerCase();

  // Return empty array for empty queries
  if (!q) {
    console.log("❌ Empty query received");
    return res.json([]);
  }

  try {
    console.log("🔍 Searching for:", q);

    // Search fresh articles first
    const fresh = await query(
      `SELECT
        id,
        title,
        summary AS description,
        summary,
        link,
        image_url,
        category,
        created_at
      FROM news_articles
      WHERE is_archived = FALSE
        AND (LOWER(title) LIKE $1 OR LOWER(summary) LIKE $1)
      ORDER BY created_at DESC
      LIMIT 30`,
      [`%${q}%`]
    );

    console.log("📊 Fresh articles found:", fresh.rows.length);

    if (fresh.rows.length) {
      console.log("✅ Returning fresh articles");
      return res.json(fresh.rows);
    }

    console.log("🔄 No fresh articles, searching archived...");

    // Fallback to archived articles
    const archived = await query(
      `SELECT
        id,
        title,
        summary AS description,
        summary,
        link,
        image_url,
        category,
        created_at
      FROM news_articles
      WHERE is_archived = TRUE
        AND (LOWER(title) LIKE $1 OR LOWER(summary) LIKE $1)
      ORDER BY created_at DESC
      LIMIT 30`,
      [`%${q}%`]
    );

    console.log("📊 Archived articles found:", archived.rows.length);
    console.log("✅ Returning results");

    res.json(archived.rows);
  } catch (e) {
    console.error("❌ searchNews error:", e);
    console.error("Error details:", {
      message: e.message,
      stack: e.stack,
      query: q,
    });

    // Ensure we always return JSON, even on error
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? e.message : undefined,
    });
  }
};

/* GET /api/news/business/last24h - Business articles from last 24h */
/* GET /api/news/category/last24h?category=entertainment */
export const getCategoryLast24h = async (req, res) => {
  const category = req.query.category;

  if (!category) {
    return res.status(400).json({ error: "Missing category parameter" });
  }

  try {
    const { rows } = await query(
      `
      SELECT *
      FROM news_articles
      WHERE is_archived = FALSE
        AND category @> ARRAY[$1]::text[]
        AND created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      `,
      [category]
    );

    res.json(rows);
  } catch (e) {
    console.error("getCategoryLast24h error", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
