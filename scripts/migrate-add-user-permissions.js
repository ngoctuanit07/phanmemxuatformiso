/**
 * Migration: add user_permissions table
 *
 * Chạy script này một lần để thêm bảng user_permissions vào database đang hoạt động.
 * Bảng đã được bổ sung vào init-db.js cho mọi lần khởi tạo mới.
 *
 * Usage:
 *   node scripts/migrate-add-user-permissions.js
 */

const mysql = require('mysql2/promise');

async function migrate() {
  console.log('--- Migration: Tạo bảng user_permissions ---');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phanmemxuatform',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    // Check if table already exists
    const [rows] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_permissions'`,
      [process.env.DB_NAME || 'phanmemxuatform']
    );

    if (rows.length > 0) {
      console.log('✔ Bảng user_permissions đã tồn tại, bỏ qua migration.');
      return;
    }

    await connection.query(`
      CREATE TABLE \`user_permissions\` (
        \`user_id\` INT NOT NULL,
        \`permission_id\` INT NOT NULL,
        PRIMARY KEY (\`user_id\`, \`permission_id\`),
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✔ Đã tạo bảng user_permissions thành công.');
    console.log('--- Migration hoàn tất ---');
  } catch (err) {
    console.error('Lỗi migration:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
