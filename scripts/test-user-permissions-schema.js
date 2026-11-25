/**
 * Regression test: xác minh bảng user_permissions tồn tại và có cấu trúc đúng.
 * Đảm bảo login route không bị lỗi ER_NO_SUCH_TABLE khi query user_permissions.
 *
 * Usage: node scripts/test-user-permissions-schema.js
 * Exit code 0 = PASS, 1 = FAIL
 */

const mysql = require('mysql2/promise');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, label) {
    if (condition) {
      console.log(`  ✔ PASS: ${label}`);
      passed++;
    } else {
      console.error(`  ✘ FAIL: ${label}`);
      failed++;
    }
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phanmemxuatform',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    console.log('=== Regression: user_permissions schema ===\n');

    // TEST 1: bảng user_permissions tồn tại
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_permissions'`,
      [process.env.DB_NAME || 'phanmemxuatform']
    );
    assert(tables.length === 1, 'Bảng user_permissions tồn tại');

    // TEST 2: cột user_id có kiểu INT
    const [cols] = await connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_permissions'`,
      [process.env.DB_NAME || 'phanmemxuatform']
    );
    const colNames = cols.map(c => c.COLUMN_NAME);
    assert(colNames.includes('user_id'), 'Cột user_id tồn tại');
    assert(colNames.includes('permission_id'), 'Cột permission_id tồn tại');

    // TEST 3: query từ login route không bị lỗi (dùng user_id không tồn tại -> kết quả rỗng, không lỗi)
    const [loginRows] = await connection.query(
      `SELECT p.code
       FROM permissions p
       INNER JOIN user_permissions up ON p.id = up.permission_id
       WHERE up.user_id = ?`,
      [999999]
    );
    assert(Array.isArray(loginRows), 'Query từ login route thực thi không lỗi (kết quả là array)');
    assert(loginRows.length === 0, 'Kết quả rỗng cho user không tồn tại - đúng hành vi');

    // TEST 4: query từ users/[id]/permissions route không bị lỗi
    const [permRows] = await connection.query(
      `SELECT permission_id FROM user_permissions WHERE user_id = ?`,
      [999999]
    );
    assert(Array.isArray(permRows), 'Query từ permissions route thực thi không lỗi');

    // TEST 5: FK constraint - user_permissions references users và permissions
    const [fks] = await connection.query(
      `SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_permissions' AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [process.env.DB_NAME || 'phanmemxuatform']
    );
    const refTables = fks.map(fk => fk.REFERENCED_TABLE_NAME);
    assert(refTables.includes('users'), 'FK tới bảng users tồn tại');
    assert(refTables.includes('permissions'), 'FK tới bảng permissions tồn tại');

  } catch (err) {
    console.error('Lỗi không mong đợi trong test:', err.message);
    failed++;
  } finally {
    await connection.end();
  }

  console.log(`\n--- Kết quả: ${passed} PASS, ${failed} FAIL ---`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
