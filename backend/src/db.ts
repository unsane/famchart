import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'mariadb',
  user: process.env.DB_USER || 'famchart',
  password: process.env.DB_PASSWORD || 'famchartpass',
  database: process.env.DB_NAME || 'famchart',
  connectionLimit: 5,
  acquireTimeout: 20000 // Increase timeout to 20s
});

export const checkConnection = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Database connected successfully!');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  } finally {
    if (conn) conn.release();
  }
};

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
