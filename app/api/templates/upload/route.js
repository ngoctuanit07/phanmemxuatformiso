export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractPlaceholdersFromDocx } from '@/lib/docx-engine';
import { getCurrentUser, hasPermission } from '@/lib/auth';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit

// Validate file magic bytes to prevent renamed malicious files
function validateMagicBytes(buffer, extension) {
  if (buffer.length < 4) return false;

  if (extension === 'pdf') {
    // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  if (extension === 'docx') {
    // DOCX (ZIP archive) magic bytes: PK.. (0x50 0x4B 0x03 0x04)
    return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
  }

  return false;
}

export async function POST(request) {
  try {
    // 1. Strict Authentication & Permission Check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'template.create')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền nạp mẫu biểu mới' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'Vui lòng chọn file mẫu Word (.docx) hoặc PDF' }, { status: 400 });
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        message: 'Kích thước file vượt quá giới hạn tối đa cho phép (15MB)'
      }, { status: 400 });
    }

    const fileName = file.name || 'unnamed_template.docx';
    const parts = fileName.split('.');
    if (parts.length < 2) {
      return NextResponse.json({ success: false, message: 'File không có phần mở rộng hợp lệ' }, { status: 400 });
    }

    const fileExtension = parts.pop().toLowerCase();
    if (!['docx', 'pdf'].includes(fileExtension)) {
      return NextResponse.json({
        success: false,
        message: 'Định dạng file không hỗ trợ. Vui lòng tải lên file Word (.docx) hoặc file .pdf'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Validate Magic Bytes / File Signature
    if (!validateMagicBytes(buffer, fileExtension)) {
      return NextResponse.json({
        success: false,
        message: 'Nội dung file không hợp lệ hoặc không đúng định dạng chuẩn đã chọn'
      }, { status: 400 });
    }

    // 4. Ensure uploads directory exists and is secured
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 5. Generate safe unique filename to prevent path traversal
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const sanitizedBaseName = parts.join('_').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const safeFileName = `${uniqueSuffix}-${sanitizedBaseName}.${fileExtension}`;
    const filePath = path.join(uploadDir, safeFileName);
    const publicUrl = `/uploads/templates/${safeFileName}`;

    fs.writeFileSync(filePath, buffer);

    let extractedFields = [];
    if (fileExtension === 'docx') {
      extractedFields = extractPlaceholdersFromDocx(buffer);
    }

    return NextResponse.json({
      success: true,
      data: {
        file_path: publicUrl,
        file_name: fileName,
        file_type: fileExtension,
        file_size: buffer.length,
        detected_fields: extractedFields
      },
      message: `Đã nạp file thành công! Hệ thống tìm thấy ${extractedFields.length} trường dữ liệu cần điền.`
    });
  } catch (error) {
    console.error('Error in secure template upload:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xử lý file tải lên' }, { status: 500 });
  }
}
