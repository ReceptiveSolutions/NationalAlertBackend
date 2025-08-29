// cronJob.js  (ES modules)
import cron from 'node-cron';
import dayjs from 'dayjs';
import { query } from './utils/db.js';
import { fetchAndCacheNews } from './utils/newsFetcher.js';
import { fetchAndStoreRSSNews } from './utils/rssFetcher.js';

const categories = ['business', 'sports', 'technology', 'entertainment', 'health', 'general'];
console.log('🟢 cronJob.js started: fetch + upsert every 7 minutes');

cron.schedule('*/7 * * * *', async () => {
  console.log('⏰ Fetch cycle', new Date().toLocaleTimeString());

  for (const category of categories) {
    try {
      // Fetch API News
      const { data: apiArticles } = await fetchAndCacheNews(category);
      await upsertMany(apiArticles, category);
      console.log(`✅ API: ${category} - ${apiArticles.length} articles processed`);

      // Fetch RSS News
      const rssArticles = await fetchAndStoreRSSNews(category);
      if (rssArticles?.length) {
        await upsertMany(rssArticles, category);
        console.log(`✅ RSS: ${category} - ${rssArticles.length} articles processed`);
      }

    } catch (err) {
      console.error(`❌ Error fetching for ${category}:`, err.message);
    }
  }
});

async function upsertMany(list, category) {
  for (const art of list) {
    try {
      await query(
        `INSERT INTO news_articles
          (title, summary, link, image_url, pub_date, category,
           source_type, source_name, country, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
         ON CONFLICT (link) DO NOTHING`,
        [
          art.title?.trim(),
          art.description || art.summary || null,
          art.link || art.url,
          art.image_url || null,
          art.pub_date || art.published_at || null,
          [category],
          art.article_id ? 'api' : 'rss',
          art.source_name || 'unknown',
          Array.isArray(art.country) ? art.country : ['india'],
        ]
      );
    } catch (e) {
      console.error('❌ UPSERT error:', e.code, e.detail?.slice?.(0, 120) || e.message);
      console.log({
        title: art.title,
        link: art.link,
        category,
        country: art.country
      });
    }
  }
}
