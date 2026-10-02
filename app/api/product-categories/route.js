export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let sql = `
      SELECT c.*,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS products_count
      FROM product_categories c
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (c.code LIKE ? OR c.name LIKE ? OR c.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY c.id ASC`;

    const categories = await query(sql, params);
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh mục sản phẩm' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(currentUser, 'product.create')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền thêm mới danh mục sản phẩm' }, { status: 403 });
    }

    const { code, name, description, status } = await request.json();

    if (!code || !name) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập Mã danh mục và Tên danh mục' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await queryOne(`SELECT id FROM product_categories WHERE code = ?`, [cleanCode]);
    if (existing) {
      return NextResponse.json({ success: false, message: `Mã danh mục '${cleanCode}' đã tồn tại` }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO product_categories (code, name, description, status)
       VALUES (?, ?, ?, ?)`,
      [cleanCode, name.trim(), description || '', status || 'active']
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Thêm mới danh mục sản phẩm thành công!'
    });
  } catch (error) {
    console.error('Error creating product category:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tạo danh mục sản phẩm' }, { status: 500 });
  }
}
