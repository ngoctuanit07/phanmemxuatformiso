const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const makeHeaderFieldsBasic = (noSuffix = '/PQCCPDT') => [
  { name: 'bo_phan', label: 'Bộ phận (Department)', type: 'text', required: true, default_value: '' },
  { name: 'so_phieu', label: `Số phiếu (No. ...${noSuffix})`, type: 'text', required: true, default_value: '' },
  { name: 'ten_san_pham', label: 'Tên sản phẩm (Name of product)', type: 'text', required: true, default_value: '' },
  { name: 'ma_code', label: 'Mã code (Code)', type: 'text', required: true, default_value: '' },
  { name: 'ngay_san_xuat', label: 'Ngày sản xuất (Date of manufacture)', type: 'date', required: true, default_value: '' },
  { name: 'so_lot', label: 'Số Lot (Lot number)', type: 'text', required: true, default_value: '' },
  { name: 'han_su_dung', label: 'Hạn sử dụng sản phẩm (Expiry date)', type: 'date', required: true, default_value: '' },
  { name: 'so_luong_san_xuat', label: 'Số lượng sản xuất (Total - Test)', type: 'text', required: false, default_value: '' },
  { name: 'so_luong_mau_lay', label: 'Số lượng mẫu lấy (Tested samples - Test)', type: 'text', required: false, default_value: '' },
  { name: 'phieu_lay_mau', label: 'Phiếu lấy mẫu (Sampling sheet)', type: 'text', required: false, default_value: '' },
  { name: 'ngay_lay_mau', label: 'Ngày lấy mẫu (Date of sampling)', type: 'date', required: false, default_value: '' }
];

const COMMON_HEADER_FIELDS = [
  ...makeHeaderFieldsBasic('/PQCCPDT'),
  { name: 'so_lot_chung_duong', label: 'Số lot chứng dương (Positive control lots)', type: 'text', required: false, default_value: '' },
  { name: 'han_su_dung_chung_duong', label: 'Hạn sử dụng chứng dương (Expiry date)', type: 'date', required: false, default_value: '' },
  { name: 'so_lot_chung_am', label: 'Số lot chứng âm (Negative control lots)', type: 'text', required: false, default_value: '' },
  { name: 'han_su_dung_chung_am', label: 'Hạn sử dụng chứng âm (Expiry date)', type: 'date', required: false, default_value: '' },
  { name: 'so_seri_may', label: 'Số seri máy (Machine serial number)', type: 'text', required: false, default_value: '' }
];

const klField = (name, label) => ({
  name,
  label,
  type: 'select',
  options: ['Pass/Đạt', 'Fail/K.Đạt'],
  required: false,
  default_value: ''
});

const txtField = (name, label) => ({
  name,
  label,
  type: 'text',
  required: false,
  default_value: ''
});

function buildFqc002Schema() {
  const fields = [
    ...COMMON_HEADER_FIELDS,
    txtField('the_tich_muc_chat_luong', 'Mục 1: Độ đồng đều thể tích - Mức chất lượng (µl)'),
    txtField('the_tich_ket_qua', 'Mục 1: Độ đồng đều thể tích - Kết quả (µl)'),
    klField('kl_1', 'Mục 1: Kết luận dòng (Đạt / K.Đạt)')
  ];
  for (const t of [1, 2, 3]) {
    fields.push(
      txtField(`cd_test${t}_fam_ket_qua`, `Mục 2 Chứng dương (Test ${t}) - Fam: Kết quả (Ct)`),
      klField(`kl_2_${t}_fam`, `Mục 2 Chứng dương (Test ${t}) - Fam: Kết luận`),
      txtField(`cd_test${t}_hex_muc_chat_luong`, `Mục 2 Chứng dương (Test ${t}) - Hex: Mức chất lượng (Ct)`),
      txtField(`cd_test${t}_hex_do_lech`, `Mục 2 Chứng dương (Test ${t}) - Hex: Độ lệch`),
      txtField(`cd_test${t}_hex_ket_qua`, `Mục 2 Chứng dương (Test ${t}) - Hex: Kết quả (Ct)`),
      klField(`kl_2_${t}_hex`, `Mục 2 Chứng dương (Test ${t}) - Hex: Kết luận`)
    );
  }
  for (const t of [1, 2]) {
    fields.push(
      txtField(`ca_test${t}_fam_ket_qua`, `Mục 3 Chứng âm (Test ${t}) - Fam: Kết quả (Ct)`),
      klField(`kl_3_${t}_fam`, `Mục 3 Chứng âm (Test ${t}) - Fam: Kết luận`),
      txtField(`ca_test${t}_hex_muc_chat_luong`, `Mục 3 Chứng âm (Test ${t}) - Hex: Mức chất lượng (Ct)`),
      txtField(`ca_test${t}_hex_do_lech`, `Mục 3 Chứng âm (Test ${t}) - Hex: Độ lệch`),
      txtField(`ca_test${t}_hex_ket_qua`, `Mục 3 Chứng âm (Test ${t}) - Hex: Kết quả (Ct)`),
      klField(`kl_3_${t}_hex`, `Mục 3 Chứng âm (Test ${t}) - Hex: Kết luận`)
    );
  }
  return fields;
}

function buildFqc003Schema() {
  const fields = [
    ...COMMON_HEADER_FIELDS,
    txtField('the_tich_ket_qua', 'Mục 1: Độ đồng đều thể tích (20.0 µl) - Kết quả (µl)'),
    klField('kl_1', 'Mục 1: Kết luận dòng (Đạt / K.Đạt)')
  ];
  for (const t of [1, 2, 3]) {
    for (const m of ['A', 'B', 'C']) {
      const ml = m.toLowerCase();
      fields.push(
        txtField(`cd_test${t}_mix${ml}_fam_ket_qua`, `Mục 2 Chứng dương (Test ${t} - Mix ${m}) - Fam: Kết quả (Ct)`),
        klField(`kl_2_${t}_mix${ml}`, `Mục 2 Chứng dương (Test ${t} - Mix ${m}) - Kết luận`)
      );
    }
  }
  for (const t of [1, 2]) {
    for (const m of ['A', 'B', 'C']) {
      const ml = m.toLowerCase();
      fields.push(
        txtField(`ca_test${t}_mix${ml}_fam_ket_qua`, `Mục 3 Chứng âm (Test ${t} - Mix ${m}) - Fam: Kết quả (Ct)`),
        klField(`kl_3_${t}_mix${ml}`, `Mục 3 Chứng âm (Test ${t} - Mix ${m}) - Kết luận`)
      );
    }
  }
  return fields;
}

function buildFqc004Schema() {
  const fields = [
    ...COMMON_HEADER_FIELDS,
    txtField('the_tich_ket_qua', 'Mục 1: Độ đồng đều thể tích (15.0 µl) - Kết quả (µl)'),
    klField('kl_1', 'Mục 1: Kết luận dòng (Đạt / K.Đạt)')
  ];
  const pairs = [
    { label: 'Mix 1.6', mKey: 'm16' },
    { label: 'Mix 2.3', mKey: 'm23' }
  ];
  for (const t of [1, 2, 3]) {
    for (const p of pairs) {
      for (const ch of ['Fam', 'Hex']) {
        const cl = ch.toLowerCase();
        fields.push(
          txtField(`cd_test${t}_${p.mKey}_${cl}_ket_qua`, `Mục 2 Chứng dương (Test ${t} - ${p.label}) - ${ch}: Kết quả (Ct)`),
          klField(`kl_2_${t}_${p.mKey}_${cl}`, `Mục 2 Chứng dương (Test ${t} - ${p.label}) - ${ch}: Kết luận`)
        );
      }
    }
  }
  for (const t of [1, 2]) {
    for (const p of pairs) {
      for (const ch of ['Fam', 'Hex']) {
        const cl = ch.toLowerCase();
        fields.push(
          txtField(`ca_test${t}_${p.mKey}_${cl}_ket_qua`, `Mục 3 Chứng âm (Test ${t} - ${p.label}) - ${ch}: Kết quả (Ct)`),
          klField(`kl_3_${t}_${p.mKey}_${cl}`, `Mục 3 Chứng âm (Test ${t} - ${p.label}) - ${ch}: Kết luận`)
        );
      }
    }
  }
  return fields;
}

function buildFqc005Schema() {
  const fields = [
    ...COMMON_HEADER_FIELDS,
    txtField('the_tich_ket_qua', 'Mục 1: Độ đồng đều thể tích (20.0 µl) - Kết quả (µl)'),
    klField('kl_1', 'Mục 1: Kết luận dòng (Đạt / K.Đạt)')
  ];
  for (const t of [1, 2, 3]) {
    const mix1 = t === 1 ? 'Mix 1' : 'Mix 1.6';
    const mix2 = t === 1 ? 'Mix 2' : 'Mix 2.3';
    fields.push(
      txtField(`cd_test${t}_fam_ket_qua`, `Mục 2 Chứng dương (Test ${t} - ${mix1}) - Fam: Kết quả (Ct)`),
      klField(`kl_2_${t}_fam`, `Mục 2 Chứng dương (Test ${t} - ${mix1}) - Fam: Kết luận`),
      txtField(`cd_test${t}_rox_ket_qua`, `Mục 2 Chứng dương (Test ${t} - ${mix1}) - Rox: Kết quả (Ct)`),
      klField(`kl_2_${t}_rox`, `Mục 2 Chứng dương (Test ${t} - ${mix1}) - Rox: Kết luận`),
      txtField(`cd_test${t}_hex_muc_chat_luong`, `Mục 2 Chứng dương (Test ${t} - ${mix1}) - Hex: Mức chất lượng (Ct)`),
      txtField(`cd_test${t}_hex_do_lech`, `Mục 2 Chứng dương (Test ${t} - ${mix1}) - Hex: Độ lệch`),
      txtField(`cd_test${t}_hex_ket_qua`, `Mục 2 Chứng dương (Test ${t} - ${mix1}) - Hex: Kết quả (Ct)`),
      klField(`kl_2_${t}_hex`, `Mục 2 Chứng dương (Test ${t} - ${mix1}) - Hex: Kết luận`),
      txtField(`cd_test${t}_cy3_ket_qua`, `Mục 2 Chứng dương (Test ${t} - ${mix2}) - Cy3: Kết quả (Ct)`),
      klField(`kl_2_${t}_cy3`, `Mục 2 Chứng dương (Test ${t} - ${mix2}) - Cy3: Kết luận`),
      txtField(`cd_test${t}_cy5_ket_qua`, `Mục 2 Chứng dương (Test ${t} - ${mix2}) - Cy5: Kết quả (Ct)`),
      klField(`kl_2_${t}_cy5`, `Mục 2 Chứng dương (Test ${t} - ${mix2}) - Cy5: Kết luận`)
    );
  }
  for (const t of [1, 2]) {
    fields.push(
      txtField(`ca_test${t}_fam_ket_qua`, `Mục 3 Chứng âm (Test ${t} - Mix 1.6) - Fam: Kết quả (Ct)`),
      klField(`kl_3_${t}_fam`, `Mục 3 Chứng âm (Test ${t} - Mix 1.6) - Fam: Kết luận`),
      txtField(`ca_test${t}_rox_ket_qua`, `Mục 3 Chứng âm (Test ${t} - Mix 1.6) - Rox: Kết quả (Ct)`),
      klField(`kl_3_${t}_rox`, `Mục 3 Chứng âm (Test ${t} - Mix 1.6) - Rox: Kết luận`),
      txtField(`ca_test${t}_hex_muc_chat_luong`, `Mục 3 Chứng âm (Test ${t} - Mix 1.6) - Hex: Mức chất lượng (Ct)`),
      txtField(`ca_test${t}_hex_do_lech`, `Mục 3 Chứng âm (Test ${t} - Mix 1.6) - Hex: Độ lệch`),
      txtField(`ca_test${t}_hex_ket_qua`, `Mục 3 Chứng âm (Test ${t} - Mix 1.6) - Hex: Kết quả (Ct)`),
      klField(`kl_3_${t}_hex`, `Mục 3 Chứng âm (Test ${t} - Mix 1.6) - Hex: Kết luận`),
      txtField(`ca_test${t}_cy3_ket_qua`, `Mục 3 Chứng âm (Test ${t} - Mix 2.3) - Cy3: Kết quả (Ct)`),
      klField(`kl_3_${t}_cy3`, `Mục 3 Chứng âm (Test ${t} - Mix 2.3) - Cy3: Kết luận`),
      txtField(`ca_test${t}_cy5_ket_qua`, `Mục 3 Chứng âm (Test ${t} - Mix 2.3) - Cy5: Kết quả (Ct)`),
      klField(`kl_3_${t}_cy5`, `Mục 3 Chứng âm (Test ${t} - Mix 2.3) - Cy5: Kết luận`)
    );
  }
  return fields;
}

function pushMixSchemaFields(fields, { prefix, klGroup, groupLabel, tests, mixes }) {
  for (const t of tests) {
    for (const m of mixes) {
      for (const ch of m.channels) {
        const cl = ch.toLowerCase();
        fields.push(
          txtField(`${prefix}_test${t}_${m.key}_${cl}_ket_qua`, `${groupLabel} (Test ${t} - ${m.label}) - ${ch}: Kết quả (Ct)`),
          klField(`kl_${klGroup}_${t}_${m.key}_${cl}`, `${groupLabel} (Test ${t} - ${m.label}) - ${ch}: Kết luận`)
        );
      }
    }
  }
}

function buildFqc012Schema() {
  const fields = [
    ...makeHeaderFieldsBasic('/PQCCPVA'),
    txtField('the_tich_ket_qua', 'Mục 1: Độ đồng đều thể tích (20.0 µl) - Kết quả (µl)'),
    klField('kl_1', 'Mục 1: Kết luận dòng (Đạt / K.Đạt)')
  ];
  const mixes = [
    { key: 'm1', label: 'Mix 1', channels: ['Fam', 'Rox', 'Cy5', 'Hex'] },
    { key: 'm2', label: 'Mix 2', channels: ['Fam', 'Hex', 'Rox', 'Cy5'] }
  ];
  pushMixSchemaFields(fields, { prefix: 'cd', klGroup: 2, groupLabel: 'Mục 2 Chứng dương', tests: [1], mixes });
  pushMixSchemaFields(fields, { prefix: 'ca', klGroup: 3, groupLabel: 'Mục 3 Chứng âm', tests: [1, 2], mixes });
  return fields;
}

function buildFqc14StdSchema() {
  const fields = [
    ...makeHeaderFieldsBasic('/PQCCPVA'),
    txtField('the_tich_ket_qua', 'Mục 1: Độ đồng đều thể tích (15.0 µl) - Kết quả (µl)'),
    klField('kl_1', 'Mục 1: Kết luận dòng (Đạt / K.Đạt)')
  ];
  const mixes = [
    { key: 'm1', label: 'Mix 1', channels: ['Fam', 'Cy3', 'Cy5'] },
    { key: 'm2', label: 'Mix 2', channels: ['Fam', 'Hex', 'Rox', 'Cy5'] },
    { key: 'm3', label: 'Mix 3', channels: ['Fam', 'Rox', 'Cy3', 'Cy5'] },
    { key: 'm4', label: 'Mix 4', channels: ['Fam', 'Rox', 'Cy3', 'Cy5'] }
  ];
  pushMixSchemaFields(fields, { prefix: 'cd', klGroup: 2, groupLabel: 'Mục 2 Chứng dương', tests: [1], mixes });
  pushMixSchemaFields(fields, { prefix: 'ca', klGroup: 3, groupLabel: 'Mục 3 Chứng âm', tests: [1, 2], mixes });
  return fields;
}

function buildFqcAsfvSchema() {
  const fields = [
    ...makeHeaderFieldsBasic('/PQCCPVA'),
    txtField('the_tich_ket_qua', 'Mục 1: Độ đồng đều thể tích (20.0 µl) - Kết quả (µl)'),
    klField('kl_1', 'Mục 1: Kết luận dòng (Đạt / K.Đạt)')
  ];
  for (const t of [1, 2, 3]) {
    for (const ch of ['Fam', 'Hex']) {
      fields.push(
        txtField(`cd_test${t}_${ch.toLowerCase()}_ket_qua`, `Mục 2 Chứng dương (Test ${t}) - ${ch}: Kết quả (Ct)`),
        klField(`kl_2_${t}_${ch.toLowerCase()}`, `Mục 2 Chứng dương (Test ${t}) - ${ch}: Kết luận`)
      );
    }
  }
  for (const t of [1, 2]) {
    for (const ch of ['Fam', 'Hex']) {
      fields.push(
        txtField(`ca_test${t}_${ch.toLowerCase()}_ket_qua`, `Mục 3 Chứng âm (Test ${t}) - ${ch}: Kết quả (Ct)`),
        klField(`kl_3_${t}_${ch.toLowerCase()}`, `Mục 3 Chứng âm (Test ${t}) - ${ch}: Kết luận`)
      );
    }
  }
  return fields;
}

function buildFqc013Schema() {
  const fields = [
    ...makeHeaderFieldsBasic('/PQCCPDT'),
    txtField('the_tich_ket_qua', 'Mục 1: Độ đồng đều thể tích (20.0 µl) - Kết quả (µl)'),
    klField('kl_1', 'Mục 1: Kết luận dòng (Đạt / K.Đạt)')
  ];
  for (const ch of ['Fam', 'Rox', 'Hex']) {
    fields.push(
      txtField(`cd_test1_${ch.toLowerCase()}_ket_qua`, `Mục 2 Chứng dương (Test 1) - ${ch}: Kết quả (Ct)`),
      klField(`kl_2_1_${ch.toLowerCase()}`, `Mục 2 Chứng dương (Test 1) - ${ch}: Kết luận`)
    );
  }
  for (const t of [1, 2]) {
    for (const ch of ['Fam', 'Rox', 'Hex']) {
      fields.push(
        txtField(`ca_test${t}_${ch.toLowerCase()}_ket_qua`, `Mục 3 Chứng âm (Test ${t}) - ${ch}: Kết quả (Ct)`),
        klField(`kl_3_${t}_${ch.toLowerCase()}`, `Mục 3 Chứng âm (Test ${t}) - ${ch}: Kết luận`)
      );
    }
  }
  return fields;
}

const FQC_TEMPLATES = [
  {
    code: 'FQC-002-02',
    name: 'Kết quả kiểm tra chất lượng bán thành phẩm (FQC-002-02)',
    description: 'Biểu mẫu Dong Tam JSC (DQC-005): Kết quả kiểm tra chất lượng bán thành phẩm. Điền đầy đủ các mục .... trên phiếu, giữ nguyên phần Kết luận/Kiến nghị/Ngày/Chữ ký cuối trang 2.',
    fileName: 'fqc_002_02.docx',
    schemaBuilder: buildFqc002Schema
  },
  {
    code: 'FQC-003-02',
    name: 'Kết quả kiểm tra chất lượng bán thành phẩm HBV GENOTYPE (FQC-003-02)',
    description: 'Biểu mẫu Dong Tam JSC (DQC-005): Kết quả kiểm tra chất lượng bán thành phẩm HBV GENOTYPE (Mix A/B/C). Điền các mục .... trên phiếu, giữ nguyên phần ký duyệt cuối trang 2.',
    fileName: 'fqc_003_02.docx',
    schemaBuilder: buildFqc003Schema
  },
  {
    code: 'FQC-004-02',
    name: 'Kết quả kiểm tra chất lượng bán thành phẩm HCV GENOTYPE (FQC-004-02)',
    description: 'Biểu mẫu Dong Tam JSC (DQC-005): Kết quả kiểm tra chất lượng bán thành phẩm HCV GENOTYPE (Mix 1.6 / Mix 2.3). Điền các mục .... trên phiếu, giữ nguyên phần ký duyệt cuối trang 2.',
    fileName: 'fqc_004_02.docx',
    schemaBuilder: buildFqc004Schema
  },
  {
    code: 'FQC-005-02',
    name: 'Kết quả kiểm tra chất lượng bán thành phẩm NGN/CHT/GV/TV (FQC-005-02)',
    description: 'Biểu mẫu Dong Tam JSC (DQC-005): Kết quả kiểm tra chất lượng bán thành phẩm NGN/CHT/GV/TV (Fam/Rox/Hex/Cy3/Cy5). Điền các mục .... trên phiếu, giữ nguyên phần ký duyệt cuối trang 2.',
    fileName: 'fqc_005_02.docx',
    schemaBuilder: buildFqc005Schema
  },
  {
    code: 'FQC-012-01',
    name: 'Kết quả kiểm tra chất lượng bán thành phẩm 7RP (FQC-012-01)',
    description: 'Biểu mẫu Dong Tam JSC (DQC-005): Kết quả kiểm tra chất lượng bán thành phẩm 7RP (Mix 1 & Mix 2 - Fam/Rox/Cy5/Hex). Điền thông tin lô & kết quả, giữ nguyên phần Kết luận/Kiến nghị/Chữ ký cuối phiếu.',
    fileName: 'fqc_012_01_7rp.docx',
    schemaBuilder: buildFqc012Schema
  },
  {
    code: 'FQC-005-02-14STD',
    name: 'Kết quả kiểm tra chất lượng bán thành phẩm 14STD (FQC-005-02)',
    description: 'Biểu mẫu Dong Tam JSC (DQC-005): Kết quả kiểm tra chất lượng bán thành phẩm 14STD (Mix 1..4 - 46 chỉ tiêu). Điền thông tin lô & kết quả, giữ nguyên phần Kết luận/Kiến nghị/Chữ ký cuối phiếu.',
    fileName: 'fqc_005_02_14std.docx',
    schemaBuilder: buildFqc14StdSchema
  },
  {
    code: 'FQC-005-V2-ASFV',
    name: 'Kết quả kiểm tra chất lượng bán thành phẩm LightPower iVAASFV (FQC-005 Ver. 2.0)',
    description: 'Biểu mẫu Viet A / Dong Tam (DQC-005): Kết quả kiểm tra chất lượng bán thành phẩm iVAASFV (FQC-005 Phiên bản 2.0 - Fam/Hex). Điền thông tin lô & kết quả, giữ nguyên phần ký duyệt cuối phiếu.',
    fileName: 'fqc_005_v2_asfv.docx',
    schemaBuilder: buildFqcAsfvSchema
  },
  {
    code: 'FQC-013-01',
    name: 'Kết quả kiểm tra chất lượng bán thành phẩm WSSV-MBV (FQC-013-01)',
    description: 'Biểu mẫu Dong Tam JSC (DQC-005): Kết quả kiểm tra chất lượng bán thành phẩm Firepower iMBWSSV-MBV (Fam/Rox/Hex). Điền thông tin lô & kết quả, giữ nguyên phần ký duyệt cuối phiếu.',
    fileName: 'fqc_013_01_wssv.docx',
    schemaBuilder: buildFqc013Schema
  }
];

async function seedFqcForms() {
  console.log('--- Đang nạp toàn bộ biểu mẫu FQC (8 biểu mẫu) vào cơ sở dữ liệu ---');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phanmemxuatform',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    await connection.query(
      `INSERT INTO template_categories (name, code, description)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
      [
        'Kiểm tra chất lượng (QC)',
        'KTCL',
        'Biểu mẫu kết quả kiểm tra chất lượng bán thành phẩm, thành phẩm (DQC / FQC)'
      ]
    );
    const [catRows] = await connection.query(`SELECT id FROM template_categories WHERE code = 'KTCL'`);
    const categoryId = catRows[0]?.id || 4;

    for (const tpl of FQC_TEMPLATES) {
      const docxPath = path.join(__dirname, '..', 'public', 'uploads', 'templates', tpl.fileName);
      if (!fs.existsSync(docxPath)) {
        throw new Error(`Không tìm thấy file template tại: ${docxPath}`);
      }
      const fileSize = fs.statSync(docxPath).size;
      const fieldsSchema = tpl.schemaBuilder();

      await connection.query(
        `INSERT INTO templates (code, name, description, category_id, file_path, file_name, file_type, file_size, fields_schema, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, 'docx', ?, ?, 'active', 1)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           category_id = VALUES(category_id),
           file_path = VALUES(file_path),
           file_name = VALUES(file_name),
           file_size = VALUES(file_size),
           fields_schema = VALUES(fields_schema),
           status = VALUES(status)`,
        [
          tpl.code,
          tpl.name,
          tpl.description,
          categoryId,
          `/uploads/templates/${tpl.fileName}`,
          tpl.fileName,
          fileSize,
          JSON.stringify(fieldsSchema)
        ]
      );

      const [rows] = await connection.query(`SELECT id, code, name FROM templates WHERE code = ?`, [tpl.code]);
      console.log(`✔ ${rows[0].code} (id=${rows[0].id}, ${fieldsSchema.length} trường): ${rows[0].name}`);
    }
  } finally {
    await connection.end();
  }
}

seedFqcForms().catch((err) => {
  console.error('Lỗi nạp biểu mẫu FQC:', err);
  process.exit(1);
});
