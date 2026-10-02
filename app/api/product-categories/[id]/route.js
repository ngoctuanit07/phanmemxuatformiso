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
    const category = await queryOne(
      `SELECT c.*,
              (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS products_count
       FROM product_categories c
       WHERE c.id = ?`,
      [id]
    );

    if (!category) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy danh mục' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh mục' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(currentUser, 'product.edit')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền sửa danh mục sản phẩm' }, { status: 403 });
    }

    const id = params.id;
    const { code, name, description, status } = await request.json();

    if (!code || !name) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập đầy đủ Mã danh mục và Tên danh mục' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await queryOne(`SELECT id FROM product_categories WHERE code = ? AND id != ?`, [cleanCode, id]);
    if (existing) {
      return NextResponse.json({ success: false, message: `Mã danh mục '${cleanCode}' đã được sử dụng` }, { status: 400 });
    }

    await query(
      `UPDATE product_categories
       SET code = ?, name = ?, description = ?, status = ?
       WHERE id = ?`,
      [cleanCode, name.trim(), description || '', status || 'active', id]
    );

    return NextResponse.json({ success: true, message: 'Cập nhật danh mục thành công!' });
  } catch (error) {
    console.error('Error updating product category:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật danh mục' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(currentUser, 'product.delete')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền xóa danh mục sản phẩm' }, { status: 403 });
    }

    const id = params.id;
    await query(`DELETE FROM product_categories WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Đã xóa danh mục thành công' });
  } catch (error) {
    console.error('Error deleting product category:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xóa danh mục' }, { status: 500 });
  }
}
