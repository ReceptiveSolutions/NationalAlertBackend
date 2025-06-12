import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndCacheNews } from '../utils/newsFetcher.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(__dirname, '../cache');
const CATEGORIES = ['general', 'business', 'sports', 'entertainment', 'technology', 'health'];

// Same as before — no changes to logic
router.get('/', async (req, res) => {
  req.params.category = 'business';
  return handleNews(req, res);
});

router.get('/:category', async (req, res) => {
  return handleNews(req, res);
});

router.get('/articles/:id', async (req, res) => {
  const articleId = req.params.id;

  try {
    for (const category of CATEGORIES) {
      const cacheFile = path.join(CACHE_DIR, `${category}Cache.json`);

      if (fs.existsSync(cacheFile)) {
        try {
          const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));

          const article = cachedData.find(item =>
            item.article_id === articleId ||
            item.id === articleId ||
            item.id === parseInt(articleId)
          );

          if (article) {
            return res.json(article);
          }
        } catch (parseError) {
          console.error(`Error parsing ${category} cache:`, parseError);
        }
      }
    }

    res.status(404).json({
      error: 'Article not found',
      message: 'The requested article could not be found in our database.'
    });
  } catch (error) {
    console.error('Error fetching individual article:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve article.'
    });
  }
});

async function handleNews(req, res) {
  const category = req.params.category || 'business';

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const result = await fetchAndCacheNews(category);
    res.json(result);
  } catch (error) {
    console.error(`🚨 Error in handleNews for category [${category}]:`, error.message);
    res.status(500).json({
      error: `Failed to fetch ${category} news`,
      details: error.message
    });
  }
}

export default router;
