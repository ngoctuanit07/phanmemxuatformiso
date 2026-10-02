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
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status') || 'active';

    let sql = `
      SELECT p.id, p.code, p.name, p.category_id, p.unit, p.price, p.description, p.status,
             p.created_at, p.updated_at,
             c.name AS category_name, c.code AS category_code
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status !== 'all') {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    if (categoryId) {
      sql += ` AND p.category_id = ?`;
      params.push(categoryId);
    }

    if (search) {
      sql += ` AND (p.code LIKE ? OR p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY p.id DESC`;

    const products = await query(sql, params);
    const categories = await query(`SELECT id, code, name FROM product_categories WHERE status = 'active' ORDER BY name ASC`);

    return NextResponse.json({ success: true, products, categories });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh sách sản phẩm' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(currentUser, 'product.create')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền thêm mới sản phẩm' }, { status: 403 });
    }

    const body = await request.json();
    const { code, name, category_id, unit, price, description, status } = body;

    if (!code || !name) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập đầy đủ Mã code và Tên sản phẩm' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check code uniqueness
    const existing = await queryOne(`SELECT id FROM products WHERE code = ?`, [cleanCode]);
    if (existing) {
      return NextResponse.json({ success: false, message: `Mã sản phẩm '${cleanCode}' đã tồn tại trong hệ thống` }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO products (code, name, category_id, unit, price, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanCode,
        name.trim(),
        category_id || null,
        unit || 'Cái',
        parseFloat(price) || 0,
        description || '',
        status || 'active'
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Thêm mới sản phẩm thành công!'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tạo sản phẩm' }, { status: 500 });
  }
}
