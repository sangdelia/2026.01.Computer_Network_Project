import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function execute(sql: string, values?: any[]) {
  const conn = await pool.getConnection();
  try {
    await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    const result = await conn.execute(sql, values);
    return result;
  } finally {
    conn.release();
  }
}

export default pool;
