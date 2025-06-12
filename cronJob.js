import cron from 'node-cron';
import fetch from 'node-fetch';

console.log("🟢 cronJob.js loaded and scheduler setup starting...");

const categories = ['business', 'sports', 'technology', 'entertainment', 'health', 'general'];
const BASE_URL = process.env.BASE_URL || "http://localhost:5000/api/news";


cron.schedule('*/1 * * * *', async () => {
  console.log('⏰ Cron job triggered...');
  
  for (const category of categories) {
    try {
      const res = await fetch(`${BASE_URL}/${category}`);
      const data = await res.json();

      console.log(`📂 CATEGORY: ${category}`);
      console.log(`📌 Source: ${data.fromCache ? 'Cached' : 'Fresh'}`);
      console.log(`📰 Articles Fetched: ${data.data.length}`);
      console.log('🧪 Sample Title:', data.data[0]?.title);
      console.log('----------------------------------------');
    } catch (err) {
      console.error(`❌ Error fetching ${category}:`, err.message);
    }
  }
});
