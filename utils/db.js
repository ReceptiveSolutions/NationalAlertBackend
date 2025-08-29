// utils/db.js
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool(
  process.env.PG_URL
    ? {
        connectionString: process.env.PG_URL,
        ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
    : {
        host:     process.env.PG_HOST,
        port:     process.env.PG_PORT || 5432,
        database: process.env.PG_DATABASE,
        user:     process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        ssl:      process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
);

export const query = (text, params) => pool.query(text, params);
