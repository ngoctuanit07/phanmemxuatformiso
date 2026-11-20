import { query } from '../lib/db.js';

async function verify() {
  const rows = await query('SELECT id, code, name, fields_schema FROM templates');
  for (const r of rows) {
    const fields = typeof r.fields_schema === 'string' ? JSON.parse(r.fields_schema) : r.fields_schema;
    const match = fields.filter(f => /bo_phan|phong_ban|so_phieu/i.test(f.name));
    console.log('ID ' + r.id + ' (' + r.code + '):');
    for (const m of match) {
      console.log('  ' + m.name + ': label=[' + m.label + '], type=' + m.type + ', options=' + JSON.stringify(m.options || []));
    }
  }
  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
