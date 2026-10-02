export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    const id = params.id;
    const template = await queryOne(
      `SELECT t.*, c.name AS category_name, u.full_name AS created_by_name
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
    const body = await request.json();
    const { name, description, category_id, fields_schema, status } = body;

    const schemaJson = typeof fields_schema === 'string' ? fields_schema : JSON.stringify(fields_schema || []);

    await query(
      `UPDATE templates
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           category_id = COALESCE(?, category_id),
           fields_schema = COALESCE(?, fields_schema),
           status = COALESCE(?, status),
           version = version + 1
       WHERE id = ?`,
      [name, description, category_id, schemaJson, status, id]
    );

    return NextResponse.json({ success: true, message: 'Cập nhật cấu hình biểu mẫu thành công!' });
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
    await query(`DELETE FROM templates WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Đã xóa biểu mẫu thành công' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xóa biểu mẫu' }, { status: 500 });
  }
}
