const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../cache');
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const CATEGORIES = {
  general: { category: 'top' },
  business: { q: 'stocks OR market OR finance OR economy', category: 'business' },
  sports: { category: 'sports' },
  entertainment: { category: 'entertainment' },
  technology: { q: 'tech OR gadget OR software OR ai', category: 'technology' },
  health: { q: 'health OR medicine OR fitness', category: 'health' }
};

const fetchAndCacheNews = async (category) => {
  const cacheFile = path.join(CACHE_DIR, `${category}Cache.json`);
  const params = CATEGORIES[category] || CATEGORIES.business;

  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const now = Date.now();
    if ((now - stats.mtimeMs) < CACHE_TIME) {
      const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      return { fromCache: true, data: cachedData };
    }
  }

  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) throw new Error('API key missing');

    const response = await axios.get('https://newsdata.io/api/1/news', {
      params: {
        apikey: apiKey,
        ...params,
        language: 'en'
      },
      timeout: 5000
    });

    if (response.data.results && Array.isArray(response.data.results)) {
      fs.writeFileSync(cacheFile, JSON.stringify(response.data.results));
      return { fromCache: false, data: response.data.results };
    }

    throw new Error('Invalid API response structure');
  } catch (error) {
    console.error(`❌ Error fetching ${category} news:`, error.message);
    if (fs.existsSync(cacheFile)) {
      const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      return { fromCache: true, data: cachedData, error: 'Using cached data due to API failure' };
    }
    throw error;
  }
};

const fetchAndCacheAllNews = async () => {
  for (let category of Object.keys(CATEGORIES)) {
    await fetchAndCacheNews(category);
  }
};

module.exports = {
  fetchAndCacheNews,
  fetchAndCacheAllNews
};

