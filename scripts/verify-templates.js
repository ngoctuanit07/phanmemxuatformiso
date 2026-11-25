const mysql = require('mysql2/promise');

async function verify() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phanmemxuatform',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    const [rows] = await connection.execute('SELECT id, code, name, fields_schema FROM templates');
    for (const r of rows) {
      const fields = typeof r.fields_schema === 'string' ? JSON.parse(r.fields_schema) : r.fields_schema;
      const match = fields.filter(f => /bo_phan|phong_ban|so_phieu/i.test(f.name));
      console.log('ID ' + r.id + ' (' + r.code + '):');
      for (const m of match) {
        console.log('  ' + m.name + ': label=[' + m.label + '], type=' + m.type + ', options=' + JSON.stringify(m.options || []));
      }
    }
  } finally {
    await connection.end();
  }
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
