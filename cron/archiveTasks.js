// cron/archiveTasks.js
import cron from 'node-cron';
import { query } from '../utils/db.js';

console.log('🟢 archiveTasks.js started');

// Archive news older than 24 hours
cron.schedule('10 2 * * *', async () => {
  const { rowCount } = await query(`
    UPDATE news_articles
    SET is_archived = TRUE
    WHERE is_archived = FALSE
      AND created_at < NOW() - INTERVAL '24 hours'
  `);
  console.log(`📦 Archived ${rowCount}`);
});

// Delete news archived for more than 6 months
cron.schedule('0 3 1 * *', async () => {
  const { rowCount } = await query(`
    DELETE FROM news_articles
    WHERE is_archived = TRUE
      AND created_at < NOW() - INTERVAL '6 months'
  `);
  console.log(`🗑️  Deleted ${rowCount} rows older than 6 months`);
});

// // Archive rows older than 2 minutes
// cron.schedule('* * * * *', async () => {
//   const { rowCount } = await query(`
//     UPDATE news_articles
//     SET is_archived = TRUE
//     WHERE is_archived = FALSE
//       AND created_at < NOW() - INTERVAL '2 minutes'
//   `);
//   console.log(`📦 Archived ${rowCount}`);
// });

// // Delete rows archived for more than 2 minutes
// cron.schedule('* * * * *', async () => {
//   const { rowCount } = await query(`
//     DELETE FROM news_articles
//     WHERE is_archived = TRUE
//       AND created_at < NOW() - INTERVAL '2 minutes'
//   `);
//   console.log(`🗑️ Deleted ${rowCount} rows older than 2 minutes`);
// });
