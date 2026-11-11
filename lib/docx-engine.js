import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import mammoth from 'mammoth';

const FQC_TEMPLATE_CODES = new Set([
  'FQC-002-02',
  'FQC-003-02',
  'FQC-004-02',
  'FQC-005-02',
  'FQC-012-01',
  'FQC-005-02-14STD',
  'FQC-005-V2-ASFV',
  'FQC-013-01'
]);

const FQC_DATE_FIELDS = new Set([
  'ngay_san_xuat',
  'han_su_dung',
  'ngay_lay_mau',
  'han_su_dung_chung_duong',
  'han_su_dung_chung_am'
]);

const FQC_COMMON_DOTS = {
  bo_phan: '........................',
  so_phieu: '..........................',
  ten_san_pham: '........................................................................................',
  ma_code: '.................................................................................................',
  ngay_san_xuat: '.........................',
  so_lot: '.........................',
  han_su_dung: '...........................................................................................',
  so_luong_san_xuat: '.............................',
  so_luong_mau_lay: '............................',
  phieu_lay_mau: '............................',
  ngay_lay_mau: '........................',
  so_lot_chung_duong: '....................',
  han_su_dung_chung_duong: '........................',
  so_lot_chung_am: '.....................',
  han_su_dung_chung_am: '........................',
  so_seri_may: '....................................................................................'
};

function getFqcFallbackValue(tag) {
  if (tag.startsWith('kl_') && (tag.endsWith('_p') || tag.endsWith('_f'))) {
    return '☐';
  }
  if (FQC_COMMON_DOTS[tag]) {
    return FQC_COMMON_DOTS[tag];
  }
  if (tag.endsWith('_hex_muc_chat_luong') || tag.endsWith('_hex_do_lech')) {
    return '........';
  }
  return '..........';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDisplayDate(value) {
  const trimmed = String(value || '').trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return trimmed;
}

/**
 * Normalizes raw form data for template rendering (dates, duplicate units, checkbox pairs, empty fallbacks).
 */
export function prepareFormDataForTemplate(templateCode, rawData = {}) {
  const sanitized = {};
  for (const [key, value] of Object.entries(rawData || {})) {
    sanitized[key] = value !== undefined && value !== null ? String(value) : '';
  }

  if (!FQC_TEMPLATE_CODES.has(templateCode)) {
    return sanitized;
  }

  const normalized = { ...sanitized };

  for (const [key, fallbackDots] of Object.entries(FQC_COMMON_DOTS)) {
    const val = (normalized[key] || '').trim();
    normalized[key] = val ? (FQC_DATE_FIELDS.has(key) ? formatDisplayDate(val) : val) : fallbackDots;
  }

  for (const [key, rawVal] of Object.entries(normalized)) {
    if (key in FQC_COMMON_DOTS) continue;

    if (key.startsWith('kl_') && !key.endsWith('_p') && !key.endsWith('_f')) {
      const lower = rawVal.trim().toLowerCase();
      const isPass = lower === 'pass' || lower === 'pass/đạt' || lower === 'đạt';
      const isFail = lower === 'fail' || lower === 'fail/k.đạt' || lower === 'k.đạt';
      normalized[`${key}_p`] = isPass ? '☑' : '☐';
      normalized[`${key}_f`] = isFail ? '☑' : '☐';
      continue;
    }

    let val = rawVal.trim();
    if (key.startsWith('the_tich_')) {
      val = val.replace(/\s*(?:µl|ul)\s*$/i, '').trim();
    } else if (key.endsWith('_ket_qua') || key.endsWith('_muc_chat_luong')) {
      val = val.replace(/\s*ct\s*$/i, '').trim();
    }
    normalized[key] = val || getFqcFallbackValue(key);
  }

  return normalized;
}

/**
 * Fills data into a .docx template using Docxtemplater and PizZip
 * @param {Buffer} templateBuffer - Original .docx file buffer
 * @param {Object} data - Key-value map of form data
 * @param {string|null} templateCode - Optional template code for template-specific formatting
 * @returns {Buffer} - Populated .docx file buffer
 */
export function fillDocxTemplate(templateBuffer, data = {}, templateCode = null) {
  try {
    const zip = new PizZip(templateBuffer);
    const isFqc = FQC_TEMPLATE_CODES.has(templateCode);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: (part) => (isFqc && part?.value ? getFqcFallbackValue(part.value) : '')
    });

    const sanitizedData = prepareFormDataForTemplate(templateCode, data);

    doc.render(sanitizedData);

    const generatedZip = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    return generatedZip;
  } catch (error) {
    console.error('Error filling docx template:', error);
    throw new Error(`Lỗi điền dữ liệu vào file Word: ${error.message}`);
  }
}

/**
 * Renders HTML for print/PDF preview. Uses companion .print.html if present alongside the .docx template,
 * otherwise falls back to Docxtemplater + Mammoth HTML conversion.
 */
export async function renderRecordHtml(fullTemplatePath, templateBuffer, rawData = {}, templateCode = null) {
  const companionHtmlPath = fullTemplatePath.replace(/\.docx$/i, '.print.html');
  if (companionHtmlPath !== fullTemplatePath && fs.existsSync(companionHtmlPath)) {
    const prepared = prepareFormDataForTemplate(templateCode, rawData);
    const isFqc = FQC_TEMPLATE_CODES.has(templateCode);
    const htmlTemplate = fs.readFileSync(companionHtmlPath, 'utf8');
    return htmlTemplate.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
      const val = prepared[key] !== undefined && prepared[key] !== null
        ? prepared[key]
        : (isFqc ? getFqcFallbackValue(key) : '');
      return escapeHtml(val);
    });
  }

  const filledDocxBuffer = fillDocxTemplate(templateBuffer, rawData, templateCode);
  return convertDocxToHtml(filledDocxBuffer);
}

/**
 * Auto-extracts placeholders like {ho_ten} or {{ho_ten}} from a docx file
 * @param {Buffer} templateBuffer - .docx file buffer
 * @returns {Array<{ name: string, label: string, type: string }>}
 */
export function extractPlaceholdersFromDocx(templateBuffer) {
  try {
    const zip = new PizZip(templateBuffer);
    const files = Object.keys(zip.files).filter(
      f => f.startsWith('word/') && (f.endsWith('.xml') || f.includes('document') || f.includes('header') || f.includes('footer'))
    );

    let combinedText = '';
    for (const filename of files) {
      const fileData = zip.files[filename];
      if (fileData) {
        const xml = fileData.asText();
        // Remove XML tags to reconstruct continuous text in case Word split runs
        const textWithoutXml = xml.replace(/<[^>]+>/g, '');
        combinedText += ' ' + textWithoutXml;
      }
    }

    // Match tags in format {variable_name} or {{variable_name}}
    const regex = /\{+([a-zA-Z0-9_\u00C0-\u1EF9\-]+)\}+/g;
    const matches = new Set();
    let match;

    while ((match = regex.exec(combinedText)) !== null) {
      const tag = match[1].trim();
      // Ignore common Word built-in codes or empty
      if (tag && tag.length > 1 && !tag.startsWith('_') && !tag.startsWith('w:') && isNaN(Number(tag))) {
        matches.add(tag);
      }
    }

    // Convert extracted tags to initial schema fields
    const fields = Array.from(matches).map(tag => {
      // Auto-guess Vietnamese label and type from tag name
      const lower = tag.toLowerCase();
      let type = 'text';
      let label = tag.replace(/_/g, ' ');

      if (lower.includes('ngay') || lower.includes('date')) {
        type = 'date';
      } else if (lower.includes('so_tien') || lower.includes('gia') || lower.includes('tien') || lower.includes('chi_phi')) {
        type = 'currency';
      } else if (lower.includes('so_luong') || lower.includes('tuoi') || lower.includes('count')) {
        type = 'number';
      } else if (lower.includes('ly_do') || lower.includes('noi_dung') || lower.includes('ghi_chu') || lower.includes('mo_ta')) {
        type = 'textarea';
      } else if (lower.includes('hinh_thuc') || lower.includes('loai_') || lower.includes('phong_ban')) {
        type = 'select';
      }

      // Prettify label
      label = label.charAt(0).toUpperCase() + label.slice(1);

      return {
        name: tag,
        label: label,
        type: type,
        required: true,
        default_value: '',
        options: type === 'select' ? ['Lựa chọn 1', 'Lựa chọn 2'] : []
      };
    });

    return fields;
  } catch (error) {
    console.error('Error extracting placeholders from docx:', error);
    return [];
  }
}

/**
 * Converts a .docx buffer to clean, print-optimized HTML
 * @param {Buffer} docxBuffer
 * @returns {Promise<string>}
 */
export async function convertDocxToHtml(docxBuffer) {
  try {
    const options = {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "table => table.table.table-bordered:fresh"
      ]
    };

    const result = await mammoth.convertToHtml({ buffer: docxBuffer }, options);
    const rawHtml = result.value;

    // Wrap in standard A4 document wrapper with print CSS
    const styledHtml = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>In Biểu Mẫu</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm 20mm 20mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 13.5pt;
            line-height: 1.45;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          .document-page {
            width: 100%;
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: #fff;
            padding: 10mm;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Times New Roman', Times, serif;
            margin-top: 10px;
            margin-bottom: 10px;
            text-align: center;
          }
          p {
            margin: 6px 0;
            text-align: justify;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 12pt;
          }
          table, th, td {
            border: 1px solid #444;
          }
          th, td {
            padding: 6px 10px;
            vertical-align: middle;
          }
          /* Signature tables usually don't need borders */
          .no-border table, table.signature-table, table[data-type="signature"] {
            border: none;
          }
          @media print {
            body {
              background: transparent;
            }
            .document-page {
              padding: 0;
              margin: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="document-page">
          ${rawHtml}
        </div>
      </body>
      </html>
    `;

    return styledHtml;
  } catch (error) {
    console.error('Error converting docx to HTML:', error);
    throw error;
  }
}
