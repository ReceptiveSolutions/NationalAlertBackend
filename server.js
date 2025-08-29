import express from 'express';
import dotenv  from 'dotenv';
import cors    from 'cors';

import newsRoute from './routes/newsRoute.js';
import './cronJob.js';          // fetch + upsert every 15 min
import './cron/archiveTasks.js' // archive / delete jobs

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req,res) => res.send('🚀 National Alert Backend running'));

app.use('/api/news', newsRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server http://localhost:${PORT}`));
