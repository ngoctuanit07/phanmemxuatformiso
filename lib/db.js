import mysql from 'mysql2/promise';

// Scalable MySQL Connection Pool
// Connection pool manages reusable connections efficiently, suitable for high-concurrency systems
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phanmemxuatform',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 25, // Scalable pool size for enterprise usage
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true,
  charset: 'utf8mb4'
});

/**
 * Execute SQL query with parameters using pooled connection
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters for parameterized query to prevent SQL Injection
 * @returns {Promise<any>}
 */
export async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database Query Error:', error.message, 'SQL:', sql);
    throw error;
  }
}

/**
 * Execute query and return single row
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Run operations inside a database transaction
 * @param {Function} callback - Callback function taking connection as parameter
 */
export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
