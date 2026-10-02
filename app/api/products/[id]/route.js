export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    const id = params.id;
    const product = await queryOne(
      `SELECT p.*, c.name AS category_name, c.code AS category_code
       FROM products p
       LEFT JOIN product_categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (!product) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải chi tiết sản phẩm' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(currentUser, 'product.edit')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền chỉnh sửa sản phẩm' }, { status: 403 });
    }

    const id = params.id;
    const body = await request.json();
    const { code, name, category_id, unit, price, description, status } = body;

    if (!code || !name) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập đầy đủ Mã code và Tên sản phẩm' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check code uniqueness for other products
    const existing = await queryOne(`SELECT id FROM products WHERE code = ? AND id != ?`, [cleanCode, id]);
    if (existing) {
      return NextResponse.json({ success: false, message: `Mã sản phẩm '${cleanCode}' đã được sử dụng bởi sản phẩm khác` }, { status: 400 });
    }

    await query(
      `UPDATE products
       SET code = ?,
           name = ?,
           category_id = ?,
           unit = ?,
           price = ?,
           description = ?,
           status = ?
       WHERE id = ?`,
      [
        cleanCode,
        name.trim(),
        category_id || null,
        unit || 'Cái',
        parseFloat(price) || 0,
        description || '',
        status || 'active',
        id
      ]
    );

    return NextResponse.json({ success: true, message: 'Cập nhật thông tin sản phẩm thành công!' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật sản phẩm' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(currentUser, 'product.delete')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền xóa sản phẩm' }, { status: 403 });
    }

    const id = params.id;
    await query(`DELETE FROM products WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Đã xóa sản phẩm thành công!' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xóa sản phẩm' }, { status: 500 });
  }
}
