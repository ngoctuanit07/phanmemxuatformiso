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

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'active';

    let sql = `
      SELECT t.id, t.code, t.name, t.description, t.category_id, t.file_path, t.file_name,
             t.file_type, t.file_size, t.fields_schema, t.version, t.status, t.created_at,
             c.name AS category_name,
             u.full_name AS created_by_name,
             (SELECT COUNT(*) FROM form_records fr WHERE fr.template_id = t.id) AS records_count,
             (SELECT COUNT(*) FROM print_logs pl WHERE pl.template_id = t.id) AS print_count
      FROM templates t
      LEFT JOIN template_categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status !== 'all') {
      sql += ` AND t.status = ?`;
      params.push(status);
    }

    if (categoryId) {
      sql += ` AND t.category_id = ?`;
      params.push(categoryId);
    }

    if (search) {
      sql += ` AND (t.name LIKE ? OR t.code LIKE ? OR t.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY t.created_at DESC`;

    const templates = await query(sql, params);

    // Categories list for filtering
    const categories = await query(`SELECT id, name, code FROM template_categories ORDER BY id ASC`);

    return NextResponse.json({ success: true, templates, categories });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh sách biểu mẫu' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'template.create')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền nạp biểu mẫu mới' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, description, category_id, file_path, file_name, file_type, file_size, fields_schema } = body;

    if (!name || !file_path) {
      return NextResponse.json({ success: false, message: 'Tên mẫu và file mẫu là bắt buộc' }, { status: 400 });
    }

    // Security: Only allow uploads within /uploads/ path
    if (!String(file_path).startsWith('/uploads/')) {
      return NextResponse.json({ success: false, message: 'Đường dẫn file biểu mẫu không hợp lệ' }, { status: 400 });
    }

    // Auto-generate template code if not provided
    const templateCode = code ? code.trim().toUpperCase() : `TPL-${Date.now().toString().slice(-6)}`;

    // Check code uniqueness
    const existing = await queryOne(`SELECT id FROM templates WHERE code = ?`, [templateCode]);
    if (existing) {
      return NextResponse.json({ success: false, message: `Mã biểu mẫu '${templateCode}' đã tồn tại trong hệ thống` }, { status: 400 });
    }

    const schemaJson = typeof fields_schema === 'string' ? fields_schema : JSON.stringify(fields_schema || []);

    const result = await query(
      `INSERT INTO templates (code, name, description, category_id, file_path, file_name, file_type, file_size, fields_schema, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        templateCode,
        name.trim(),
        description || '',
        category_id || null,
        file_path,
        file_name || 'template.docx',
        file_type || 'docx',
        file_size || 0,
        schemaJson,
        user.id
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Đã nạp và lưu biểu mẫu mới thành công!'
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ success: false, message: 'Lỗi lưu biểu mẫu' }, { status: 500 });
  }
}
