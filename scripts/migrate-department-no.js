const mysql = require('mysql2/promise');

const DEPARTMENT_OPTIONS = ['Phòng QA', 'Phòng Kinh Doanh', 'Phòng KCS', 'Phòng Sản xuất'];

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phanmemxuatform',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    const [rows] = await connection.execute('SELECT id, code, name, fields_schema FROM templates');

    for (const tpl of rows) {
      let schema = typeof tpl.fields_schema === 'string' ? JSON.parse(tpl.fields_schema) : tpl.fields_schema;
      if (!Array.isArray(schema)) continue;

      let changed = false;
      schema = schema.map(f => {
        const name = (f.name || '').toLowerCase();
        const label = (f.label || '').toLowerCase();

        const isDept = name === 'bo_phan' || name === 'phong_ban' || name.endsWith('_phong_ban') || name.endsWith('_bo_phan') || label.includes('bộ phận') || label.includes('department');
        const isNo = name === 'so_phieu' || label.includes('số phiếu') || label.includes('no.');

        let newField = { ...f };

        if (isDept) {
          newField.type = 'select';
          newField.options = DEPARTMENT_OPTIONS;
          if (name === 'bo_phan' || name === 'phong_ban') {
            newField.label = 'Bộ phận (Department)';
          }
          changed = true;
        }

        if (isNo) {
          if (newField.label) {
            newField.label = newField.label.replace(/\/PQCCPDT/gi, '').replace(/\(\s*No\.\s*\.{3}\s*\)/gi, '(No.)').trim();
            if (newField.label.includes('.../PQCCPDT')) {
              newField.label = 'Số phiếu (No.)';
            }
          }
          if (typeof newField.default_value === 'string' && newField.default_value.includes('/PQCCPDT')) {
            newField.default_value = newField.default_value.replace(/\/PQCCPDT/gi, '').trim();
          }
          changed = true;
        }

        return newField;
      });

      if (changed) {
        await connection.execute('UPDATE templates SET fields_schema = ? WHERE id = ?', [JSON.stringify(schema), tpl.id]);
        console.log('Updated template ID ' + tpl.id + ' [' + tpl.code + '] ' + tpl.name);
      }
    }
    console.log('Database migration completed successfully!');
  } finally {
    await connection.end();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
