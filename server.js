import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import newsRoute from './routes/newsRoute.js';
import './cronJob.js'; // ✅ this is now an ESM module

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 National Alert Backend is running!');
});

app.use('/api/news', newsRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
