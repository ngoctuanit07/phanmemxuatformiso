export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

const VALID_STATUSES = ['active', 'draft', 'archived'];
const VALID_FILE_TYPES = ['docx', 'pdf'];

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    const id = params.id;
    const template = await queryOne(
      `SELECT t.*, c.name AS category_name, u.full_name AS created_by_name,
              (SELECT COUNT(*) FROM form_records fr WHERE fr.template_id = t.id) AS records_count,
              (SELECT COUNT(*) FROM print_logs pl WHERE pl.template_id = t.id) AS print_count
       FROM templates t
       LEFT JOIN template_categories c ON t.category_id = c.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (!template) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy biểu mẫu' }, { status: 404 });
    }

    if (typeof template.fields_schema === 'string') {
      try {
        template.fields_schema = JSON.parse(template.fields_schema);
      } catch (e) {
        template.fields_schema = [];
      }
    }

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching template details:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải chi tiết biểu mẫu' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'template.edit')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền cập nhật biểu mẫu' }, { status: 403 });
    }

    const id = params.id;
    const existingTemplate = await queryOne(`SELECT * FROM templates WHERE id = ?`, [id]);
    if (!existingTemplate) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy biểu mẫu' }, { status: 404 });
    }

    const body = await request.json();
    const updates = [];
    const values = [];

    if (body.name !== undefined) {
      const cleanName = String(body.name).trim();
      if (!cleanName) {
        return NextResponse.json({ success: false, message: 'Tên biểu mẫu không được để trống' }, { status: 400 });
      }
      if (cleanName.length > 200) {
        return NextResponse.json({ success: false, message: 'Tên biểu mẫu tối đa 200 ký tự' }, { status: 400 });
      }
      updates.push('name = ?');
      values.push(cleanName);
    }

    if (body.code !== undefined) {
      const cleanCode = String(body.code).trim().toUpperCase();
      if (!cleanCode) {
        return NextResponse.json({ success: false, message: 'Mã biểu mẫu không được để trống' }, { status: 400 });
      }
      if (cleanCode.length > 50) {
        return NextResponse.json({ success: false, message: 'Mã biểu mẫu tối đa 50 ký tự' }, { status: 400 });
      }
      const duplicate = await queryOne(`SELECT id FROM templates WHERE code = ? AND id != ?`, [cleanCode, id]);
      if (duplicate) {
        return NextResponse.json({ success: false, message: `Mã biểu mẫu '${cleanCode}' đã tồn tại trong hệ thống` }, { status: 400 });
      }
      updates.push('code = ?');
      values.push(cleanCode);
    }

    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description === null ? '' : String(body.description));
    }

    if (body.category_id !== undefined) {
      const catId = body.category_id === '' || body.category_id === null ? null : Number(body.category_id);
      if (catId !== null && Number.isNaN(catId)) {
        return NextResponse.json({ success: false, message: 'Nhóm lĩnh vực không hợp lệ' }, { status: 400 });
      }
      updates.push('category_id = ?');
      values.push(catId);
    }

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, message: 'Trạng thái biểu mẫu không hợp lệ' }, { status: 400 });
      }
      updates.push('status = ?');
      values.push(body.status);
    }

    if (body.file_name !== undefined) {
      const cleanFileName = String(body.file_name).trim();
      if (!cleanFileName) {
        return NextResponse.json({ success: false, message: 'Tên tệp hiển thị không được để trống' }, { status: 400 });
      }
      if (cleanFileName.length > 255) {
        return NextResponse.json({ success: false, message: 'Tên tệp tối đa 255 ký tự' }, { status: 400 });
      }
      updates.push('file_name = ?');
      values.push(cleanFileName);
    }

    if (body.file_path !== undefined) {
      const cleanFilePath = String(body.file_path).trim();
      if (!cleanFilePath.startsWith('/uploads/')) {
        return NextResponse.json({ success: false, message: 'Đường dẫn file biểu mẫu không hợp lệ' }, { status: 400 });
      }
      updates.push('file_path = ?');
      values.push(cleanFilePath);
    }

    if (body.file_type !== undefined) {
      if (!VALID_FILE_TYPES.includes(body.file_type)) {
        return NextResponse.json({ success: false, message: 'Định dạng file không hợp lệ' }, { status: 400 });
      }
      updates.push('file_type = ?');
      values.push(body.file_type);
    }

    if (body.file_size !== undefined) {
      const parsedSize = Number(body.file_size);
      if (Number.isNaN(parsedSize) || parsedSize < 0) {
        return NextResponse.json({ success: false, message: 'Kích thước file không hợp lệ' }, { status: 400 });
      }
      updates.push('file_size = ?');
      values.push(parsedSize);
    }

    if (body.fields_schema !== undefined) {
      const schemaJson = typeof body.fields_schema === 'string'
        ? body.fields_schema
        : JSON.stringify(Array.isArray(body.fields_schema) ? body.fields_schema : []);
      updates.push('fields_schema = ?');
      values.push(schemaJson);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, message: 'Không có thông tin cần cập nhật' }, { status: 400 });
    }

    updates.push('version = version + 1');
    values.push(id);

    await query(
      `UPDATE templates SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedTemplate = await queryOne(
      `SELECT t.id, t.code, t.name, t.description, t.category_id, t.file_path, t.file_name,
              t.file_type, t.file_size, t.fields_schema, t.version, t.status, t.created_at, t.updated_at,
              c.name AS category_name,
              u.full_name AS created_by_name,
              (SELECT COUNT(*) FROM form_records fr WHERE fr.template_id = t.id) AS records_count,
              (SELECT COUNT(*) FROM print_logs pl WHERE pl.template_id = t.id) AS print_count
       FROM templates t
       LEFT JOIN template_categories c ON t.category_id = c.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      template: updatedTemplate,
      message: 'Cập nhật biểu mẫu thành công!'
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật biểu mẫu' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'template.delete')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền xóa biểu mẫu' }, { status: 403 });
    }

    const id = params.id;
    const existing = await queryOne(`SELECT id, file_path FROM templates WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy biểu mẫu' }, { status: 404 });
    }

    await query(`DELETE FROM templates WHERE id = ?`, [id]);

    // Clean up uploaded timestamped file on disk if no other template references it
    if (existing.file_path && existing.file_path.startsWith('/uploads/templates/')) {
      const baseName = path.basename(existing.file_path);
      if (/^\d+-\d+-/.test(baseName)) {
        const refRow = await queryOne(`SELECT id FROM templates WHERE file_path = ?`, [existing.file_path]);
        if (!refRow) {
          const allowedRoot = path.resolve(process.cwd(), 'public', 'uploads', 'templates');
          const fullPath = path.resolve(allowedRoot, baseName);
          if (fullPath.startsWith(allowedRoot) && fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
            } catch (unlinkErr) {
              console.warn('Could not unlink template file:', unlinkErr.message);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Đã xóa biểu mẫu thành công' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xóa biểu mẫu' }, { status: 500 });
  }
}
