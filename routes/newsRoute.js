import express from 'express';
import {
  getLatest,
  getById,
  getByCategory,
  searchNews,
  getCategoryLast24h
} from '../controllers/newsController.js';

const router = express.Router();

// 🔍 1. Most specific first — search
router.get('/search', searchNews);

// 📅 2. Specific time/category filters
router.get('/category/last24h', getCategoryLast24h);


// 🗂️ 3. Dynamic category-based fetch
router.get('/category/:category', getByCategory);

// 📰 4. All news (latest)
router.get('/', getLatest);

// 🆔 5. Catch-all — must come last!
router.get('/:id', getById);

export default router;
