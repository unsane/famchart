import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'mariadb',
  user: process.env.DB_USER || 'famchart',
  password: process.env.DB_PASSWORD || 'famchartpass',
  database: process.env.DB_NAME || 'famchart',
  connectionLimit: 5
});

export const query = async (sql: string, params?: any[]) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(sql, params);
    return res;
  } catch (err) {
    console.error('Database Query Error:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
