export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { fillDocxTemplate, convertDocxToHtml } from '@/lib/docx-engine';

export async function GET(request, { params }) {
  try {
    // 1. Authentication & Permission Check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'record.view')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền truy cập hồ sơ này' }, { status: 403 });
    }

    const id = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'docx';

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
      return NextResponse.json({ success: false, message: 'Bạn chỉ có quyền truy cập hồ sơ do chính mình tạo' }, { status: 403 });
    }

    // 2. Path Traversal Defense: Ensure target path resolves strictly within public directory
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

    // Fill data into docx template
    const filledDocxBuffer = fillDocxTemplate(templateBuffer, formData);

    if (format === 'html') {
      const html = await convertDocxToHtml(filledDocxBuffer);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    // Return populated .docx file for download
    const filename = `${record.code}_${record.file_name || 'bieu_mau_da_dien.docx'}`;
    return new NextResponse(filledDocxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': filledDocxBuffer.length.toString(),
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Error in record export:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xuất file biểu mẫu' }, { status: 500 });
  }
}
