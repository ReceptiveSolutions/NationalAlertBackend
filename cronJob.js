import cron from 'node-cron';
import fetch from 'node-fetch'; // ✅ Use node-fetch v3+
import dotenv from 'dotenv';

dotenv.config();

const categories = ['business', 'sports', 'technology', 'entertainment', 'health', 'general'];
const BASE_URL = "https://nationalalertbackend.onrender.com/api/news";

console.log("🟢 cronJob.js loaded and scheduler setup starting...");

cron.schedule('*/1 * * * *', async () => {
  console.log('⏰ Cron job triggered...');

  for (const category of categories) {
    try {
      const res = await fetch(`${BASE_URL}/${category}`);
      const contentType = res.headers.get('content-type');

      if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
      if (!contentType.includes('application/json')) throw new Error('Expected JSON but got HTML');

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
