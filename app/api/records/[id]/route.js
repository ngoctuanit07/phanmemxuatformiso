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
    if (!hasPermission(user, 'record.view')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền xem hồ sơ' }, { status: 403 });
    }

    const id = params.id;
    const record = await queryOne(
      `SELECT fr.*, t.name AS template_name, t.code AS template_code, t.file_path, t.file_type,
              t.fields_schema, u.full_name AS created_by_name
       FROM form_records fr
       INNER JOIN templates t ON fr.template_id = t.id
       INNER JOIN users u ON fr.created_by = u.id
       WHERE fr.id = ?`,
      [id]
    );

    if (!record) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy bản ghi form' }, { status: 404 });
    }

    // Role check: Staff can only access their own records
    if (user.role_code === 'STAFF' && record.created_by !== user.id) {
      return NextResponse.json({ success: false, message: 'Bạn chỉ có quyền xem hồ sơ do chính mình tạo' }, { status: 403 });
    }

    if (typeof record.form_data === 'string') {
      try {
        record.form_data = JSON.parse(record.form_data);
      } catch (e) {
        record.form_data = {};
      }
    }

    if (typeof record.fields_schema === 'string') {
      try {
        record.fields_schema = JSON.parse(record.fields_schema);
      } catch (e) {
        record.fields_schema = [];
      }
    }

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error fetching record:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải hồ sơ' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'record.edit')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền chỉnh sửa bản ghi này' }, { status: 403 });
    }

    const id = params.id;
    const existing = await queryOne(`SELECT * FROM form_records WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy bản ghi form' }, { status: 404 });
    }

    // Role check: Staff can only edit their own records
    if (user.role_code === 'STAFF' && existing.created_by !== user.id) {
      return NextResponse.json({ success: false, message: 'Bạn chỉ có quyền chỉnh sửa hồ sơ do chính mình tạo' }, { status: 403 });
    }

    const body = await request.json();
    const { title, form_data, status } = body;

    const formDataJson = typeof form_data === 'string' ? form_data : JSON.stringify(form_data);

    await query(
      `UPDATE form_records
       SET title = COALESCE(?, title),
           form_data = COALESCE(?, form_data),
           status = COALESCE(?, status),
           updated_by = ?
       WHERE id = ?`,
      [title, formDataJson, status, user.id, id]
    );

    return NextResponse.json({ success: true, message: 'Đã cập nhật bản ghi thành công' });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật hồ sơ' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'record.delete')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền xóa bản ghi' }, { status: 403 });
    }

    const id = params.id;
    const existing = await queryOne(`SELECT * FROM form_records WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy bản ghi form' }, { status: 404 });
    }

    // Role check: Staff can only delete their own records
    if (user.role_code === 'STAFF' && existing.created_by !== user.id) {
      return NextResponse.json({ success: false, message: 'Bạn chỉ có quyền xóa hồ sơ do chính mình tạo' }, { status: 403 });
    }

    await query(`DELETE FROM form_records WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Đã xóa bản ghi thành công' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xóa hồ sơ' }, { status: 500 });
  }
}
