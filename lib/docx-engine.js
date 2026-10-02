import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import mammoth from 'mammoth';

/**
 * Fills data into a .docx template using Docxtemplater and PizZip
 * @param {Buffer} templateBuffer - Original .docx file buffer
 * @param {Object} data - Key-value map of form data
 * @returns {Buffer} - Populated .docx file buffer
 */
export function fillDocxTemplate(templateBuffer, data = {}) {
  try {
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '' // Avoid "undefined" if a field was not filled
    });

    // Clean data values: convert null/undefined to empty string
    const sanitizedData = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedData[key] = value !== undefined && value !== null ? String(value) : '';
    }

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
