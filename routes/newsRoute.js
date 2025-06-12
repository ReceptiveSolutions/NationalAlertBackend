const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { fetchAndCacheNews } = require('../utils/newsFetcher');

const CACHE_DIR = path.join(__dirname, '../cache');
const CATEGORIES = ['general', 'business', 'sports', 'entertainment', 'technology', 'health'];

// ✅ Route handler for '/' defaults to business
router.get('/', async (req, res) => {
  req.params.category = 'business';
  return handleNews(req, res);
});

// ✅ Route handler for '/:category'
router.get('/:category', async (req, res) => {
  return handleNews(req, res);
});

// ✅ NEW: Route handler for individual articles
router.get('/articles/:id', async (req, res) => {
  const articleId = req.params.id;
  
  try {
    // Search through all cached categories for the article
    for (const category of CATEGORIES) {
      const cacheFile = path.join(CACHE_DIR, `${category}Cache.json`);
      
      if (fs.existsSync(cacheFile)) {
        try {
          const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
          
          // Find article by ID (check multiple possible ID fields)
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
    
    // If article not found in cache, return 404
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

// ✅ Reusable logic for category-based news
async function handleNews(req, res) {
  const category = req.params.category || 'business';

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const result = await fetchAndCacheNews(category);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: `Failed to fetch ${category} news`,
      details: error.message
    });
  }
}

module.exports = router;