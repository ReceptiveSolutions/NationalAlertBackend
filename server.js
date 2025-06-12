// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// ✅ Import cronJob to start the scheduler
require('./cronJob'); // <- Add this line

// Root route
app.get('/', (req, res) => {
  res.send('🚀 National Alert Backend is running!');
});

// Route setup
const newsRoute = require('./routes/newsRoute');
app.use('/api/news', newsRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
