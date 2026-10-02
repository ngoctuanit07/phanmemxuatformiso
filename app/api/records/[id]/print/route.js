export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { fillDocxTemplate, convertDocxToHtml } from '@/lib/docx-engine';
import { generatePdfFromHtml } from '@/lib/pdf-engine';

export async function GET(request, { params }) {
  try {
    // 1. Strict Authentication & Permission
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'record.print') && !hasPermission(currentUser, 'record.view')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền in hoặc xem hồ sơ này' }, { status: 403 });
    }

    const id = params.id;
    const { searchParams } = new URL(request.url);
    const printerName = (searchParams.get('printer') || 'Local Default Printer').substring(0, 100);
    const rawHtmlOnly = searchParams.get('raw') === 'true';

    const record = await queryOne(
      `SELECT fr.*, t.file_path, t.file_name, t.file_type, t.name AS template_name
       FROM form_records fr
       INNER JOIN templates t ON fr.template_id = t.id
       WHERE fr.id = ?`,
      [id]
    );

    if (!record) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy bản ghi form' }, { status: 404 });
    }

    // Role check: Staff can only access their own records
    if (currentUser.role_code === 'STAFF' && record.created_by !== currentUser.id) {
      return NextResponse.json({ success: false, message: 'Bạn chỉ có quyền in hồ sơ do chính mình tạo' }, { status: 403 });
    }

    // 2. Path Traversal Defense: Ensure path is within public directory
    const cleanFilePath = record.file_path.startsWith('/') ? record.file_path.substring(1) : record.file_path;
    const allowedRoot = path.resolve(process.cwd(), 'public');
    const fullTemplatePath = path.resolve(allowedRoot, cleanFilePath);

    if (!fullTemplatePath.startsWith(allowedRoot) || !fs.existsSync(fullTemplatePath)) {
      return NextResponse.json({
        success: false,
        message: 'File template mẫu không tồn tại hoặc đường dẫn không hợp lệ'
      }, { status: 404 });
    }

    const templateBuffer = fs.readFileSync(fullTemplatePath);
    const formData = typeof record.form_data === 'string' ? JSON.parse(record.form_data) : record.form_data;

    // 1. Fill data into Word template
    const filledDocxBuffer = fillDocxTemplate(templateBuffer, formData);

    // 2. Convert filled document to HTML
    const html = await convertDocxToHtml(filledDocxBuffer);

    // If client requested HTML view with auto-print
    if (rawHtmlOnly) {
      const autoPrintHtml = html.replace(
        '</body>',
        '<script>window.onload = function() { window.print(); };</script></body>'
      );
      return new NextResponse(autoPrintHtml, {
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    // 3. Convert to PDF using headless Chrome/Edge
    let pdfBuffer = null;
    let isDirectPdf = true;

    try {
      pdfBuffer = await generatePdfFromHtml(html, { format: 'A4' });
    } catch (pdfErr) {
      console.warn('Puppeteer PDF generation fallback to HTML auto-print:', pdfErr.message);
      isDirectPdf = false;
    }

    // 4. Record to print_logs and update print_count in database
    const userId = currentUser.id;
    const clientIp = (request.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();

    try {
      await query(
        `INSERT INTO print_logs (form_record_id, template_id, user_id, printer_name, paper_size, copies, ip_address, status)
         VALUES (?, ?, ?, ?, 'A4', 1, ?, 'success')`,
        [record.id, record.template_id, userId, printerName, clientIp]
      );

      await query(
        `UPDATE form_records
         SET print_count = print_count + 1, last_printed_at = NOW()
         WHERE id = ?`,
        [record.id]
      );
    } catch (logErr) {
      console.error('Error recording print log:', logErr);
    }

    // If PDF generation succeeded, return PDF stream
    if (isDirectPdf && pdfBuffer) {
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${encodeURIComponent(record.code)}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    // Fallback: return printable HTML if headless browser failed
    const fallbackHtml = html.replace(
      '</body>',
      '<script>window.onload = function() { window.print(); };</script></body>'
    );
    return new NextResponse(fallbackHtml, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Error in secure print route:', error);
    return NextResponse.json({ success: false, message: 'Lỗi in biểu mẫu' }, { status: 500 });
  }
}
