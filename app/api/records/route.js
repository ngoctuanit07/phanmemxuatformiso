export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'record.view')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền xem hồ sơ' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('template_id');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let sql = `
      SELECT fr.id, fr.code, fr.template_id, fr.title, fr.form_data, fr.status,
             fr.print_count, fr.last_printed_at, fr.created_at, fr.updated_at,
             t.name AS template_name, t.file_type AS template_type,
             u.full_name AS created_by_name
      FROM form_records fr
      INNER JOIN templates t ON fr.template_id = t.id
      INNER JOIN users u ON fr.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // RBAC: If user is STAFF (Nhân viên), they can only see their own records
    if (user.role_code === 'STAFF') {
      sql += ` AND fr.created_by = ?`;
      params.push(user.id);
    }

    if (templateId) {
      sql += ` AND fr.template_id = ?`;
      params.push(templateId);
    }

    if (status) {
      sql += ` AND fr.status = ?`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (fr.title LIKE ? OR fr.code LIKE ? OR fr.form_data LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY fr.created_at DESC`;

    const records = await query(sql, params);

    // Parse form_data JSON for each record
    const formattedRecords = records.map(r => {
      let data = {};
      if (typeof r.form_data === 'string') {
        try {
          data = JSON.parse(r.form_data);
        } catch (e) {}
      } else {
        data = r.form_data;
      }
      return { ...r, form_data: data };
    });

    return NextResponse.json({ success: true, records: formattedRecords });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh sách hồ sơ' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'record.create')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền nhập liệu form' }, { status: 403 });
    }

    const body = await request.json();
    const { template_id, title, form_data, status } = body;

    if (!template_id || !form_data) {
      return NextResponse.json({ success: false, message: 'Thiếu template_id hoặc dữ liệu form' }, { status: 400 });
    }

    // Verify template exists
    const template = await queryOne(`SELECT id FROM templates WHERE id = ?`, [template_id]);
    if (!template) {
      return NextResponse.json({ success: false, message: 'Biểu mẫu không tồn tại' }, { status: 404 });
    }

    // Generate unique record code: REC-YYYYMMDD-Random
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.floor(1000 + Math.random() * 9000);
    const recordCode = `REC-${dateStr}-${randStr}`;

    const formDataJson = typeof form_data === 'string' ? form_data : JSON.stringify(form_data);
    const recordTitle = title ? title.trim() : `Hồ sơ ${recordCode}`;

    const result = await query(
      `INSERT INTO form_records (code, template_id, title, form_data, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        recordCode,
        template_id,
        recordTitle,
        formDataJson,
        status || 'completed',
        user.id
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      code: recordCode,
      message: 'Đã lưu thông tin form vào cơ sở dữ liệu thành công!'
    });
  } catch (error) {
    console.error('Error creating form record:', error);
    return NextResponse.json({ success: false, message: 'Lỗi lưu hồ sơ' }, { status: 500 });
  }
}
