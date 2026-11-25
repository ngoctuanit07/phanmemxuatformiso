/**
 * Regression test: Kiểm tra 3 scripts seed/migrate chạy đúng
 * - seed-db.js           : CJS, dùng mysql2/promise trực tiếp → phải exit 0, không có ESM warning
 * - seed-fqc-forms.js    : CJS, dùng mysql2/promise trực tiếp → phải exit 0, không có ESM warning
 * - migrate-department-no.js : BUGFIX-002 — đã chuyển từ ESM import sang CJS require → phải exit 0, không có MODULE_TYPELESS_PACKAGE_JSON warning
 *
 * Chạy: node scripts/test-scripts-regression.js
 */
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

let pass = 0;
let fail = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✔ PASS: ${name}`);
    pass++;
  } catch (e) {
    console.error(`✘ FAIL: ${name}`);
    console.error('  ', e.message);
    fail++;
  }
}

function runScript(scriptRelPath) {
  const scriptPath = path.join(ROOT, scriptRelPath);
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  try {
    const result = execSync(`node "${scriptPath}"`, {
      cwd: ROOT,
      timeout: 30000,
      encoding: 'utf8'
    });
    stdout = result;
  } catch (err) {
    exitCode = err.status || 1;
    stdout = err.stdout || '';
    stderr = err.stderr || '';
  }
  return { exitCode, stdout, stderr };
}

console.log('\n=== Regression Test: seed/migrate scripts ===\n');

// --- seed-db.js ---
const seedDb = runScript('scripts/seed-db.js');

test('seed-db.js: exit code 0', () => {
  if (seedDb.exitCode !== 0) throw new Error(`exit code = ${seedDb.exitCode}`);
});

test('seed-db.js: không có ESM/MODULE_TYPELESS warning', () => {
  if (seedDb.stderr.includes('MODULE_TYPELESS_PACKAGE_JSON')) {
    throw new Error('Có MODULE_TYPELESS_PACKAGE_JSON warning trong stderr');
  }
});

test('seed-db.js: in ra KHỞI TẠO DỮ LIỆU HOÀN TẤT', () => {
  if (!seedDb.stdout.includes('KHỞI TẠO DỮ LIỆU HOÀN TẤT')) {
    throw new Error('Không tìm thấy dòng hoàn tất trong stdout');
  }
});

// --- seed-fqc-forms.js ---
const seedFqc = runScript('scripts/seed-fqc-forms.js');

test('seed-fqc-forms.js: exit code 0', () => {
  if (seedFqc.exitCode !== 0) throw new Error(`exit code = ${seedFqc.exitCode}`);
});

test('seed-fqc-forms.js: không có ESM/MODULE_TYPELESS warning', () => {
  if (seedFqc.stderr.includes('MODULE_TYPELESS_PACKAGE_JSON')) {
    throw new Error('Có MODULE_TYPELESS_PACKAGE_JSON warning trong stderr');
  }
});

test('seed-fqc-forms.js: seed đủ 8 biểu mẫu FQC', () => {
  const fqcCodes = ['FQC-002-02', 'FQC-003-02', 'FQC-004-02', 'FQC-005-02', 'FQC-012-01', 'FQC-005-02-14STD', 'FQC-005-V2-ASFV', 'FQC-013-01'];
  for (const code of fqcCodes) {
    if (!seedFqc.stdout.includes(code)) {
      throw new Error(`Không tìm thấy ${code} trong stdout`);
    }
  }
});

// --- migrate-department-no.js ---
const migrate = runScript('scripts/migrate-department-no.js');

test('migrate-department-no.js: exit code 0 (BUGFIX-002)', () => {
  if (migrate.exitCode !== 0) throw new Error(`exit code = ${migrate.exitCode}`);
});

test('migrate-department-no.js: không có MODULE_TYPELESS_PACKAGE_JSON warning (BUGFIX-002)', () => {
  if (migrate.stderr.includes('MODULE_TYPELESS_PACKAGE_JSON')) {
    throw new Error('Vẫn còn MODULE_TYPELESS_PACKAGE_JSON warning — ESM import chưa được xóa!');
  }
});

test('migrate-department-no.js: không có "import" ESM syntax trong file', () => {
  const fs = require('fs');
  const content = fs.readFileSync(path.join(ROOT, 'scripts/migrate-department-no.js'), 'utf8');
  if (/^import\s+/m.test(content)) {
    throw new Error("File vẫn còn dòng bắt đầu bằng 'import' (ESM)");
  }
});

test('migrate-department-no.js: in ra "Database migration completed successfully!"', () => {
  if (!migrate.stdout.includes('Database migration completed successfully!')) {
    throw new Error('Không tìm thấy dòng hoàn tất trong stdout');
  }
});

test('migrate-department-no.js: dùng require() thay vì import (CJS)', () => {
  const fs = require('fs');
  const content = fs.readFileSync(path.join(ROOT, 'scripts/migrate-department-no.js'), 'utf8');
  if (!content.includes("require('mysql2/promise')")) {
    throw new Error("Không tìm thấy require('mysql2/promise') — CJS pattern bị thiếu");
  }
});

// --- verify-templates.js (BUGFIX-003) ---
const verifyTpl = runScript('scripts/verify-templates.js');

test('verify-templates.js: exit code 0', () => {
  if (verifyTpl.exitCode !== 0) throw new Error(`exit code = ${verifyTpl.exitCode}`);
});

test('verify-templates.js: không có MODULE_TYPELESS_PACKAGE_JSON warning', () => {
  if (verifyTpl.stderr.includes('MODULE_TYPELESS_PACKAGE_JSON')) {
    throw new Error('Vẫn còn MODULE_TYPELESS_PACKAGE_JSON warning — ESM import chưa được xóa!');
  }
});

test('verify-templates.js: không có "import" ESM syntax và dùng require()', () => {
  const fs = require('fs');
  const content = fs.readFileSync(path.join(ROOT, 'scripts/verify-templates.js'), 'utf8');
  if (/^import\s+/m.test(content)) {
    throw new Error("File vẫn còn dòng bắt đầu bằng 'import' (ESM)");
  }
  if (!content.includes("require('mysql2/promise')")) {
    throw new Error("Không tìm thấy require('mysql2/promise') — CJS pattern bị thiếu");
  }
});

// --- init-orders.js ---
const initOrders = runScript('scripts/init-orders.js');

test('init-orders.js: exit code 0', () => {
  if (initOrders.exitCode !== 0) throw new Error(`exit code = ${initOrders.exitCode}\n${initOrders.stderr}`);
});

// --- test-order.cjs & test-security.cjs exit code propagation ---
test('test-order.cjs & test-security.cjs: không nuốt lỗi bằng catch(console.error)', () => {
  const fs = require('fs');
  for (const rel of ['scripts/test-order.cjs', 'scripts/test-security.cjs']) {
    const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    if (/\.catch\(\s*console\.error\s*\)/.test(content)) {
      throw new Error(`${rel} vẫn dùng .catch(console.error) làm mất exit code != 0`);
    }
    if (!content.includes('process.exit(1)')) {
      throw new Error(`${rel} thiếu process.exit(1) khi reject`);
    }
  }
});

console.log(`\n=== Kết quả: ${pass} PASS, ${fail} FAIL ===\n`);

if (fail > 0) {
  process.exit(1);
}
