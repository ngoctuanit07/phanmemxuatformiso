export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

/**
 * GET /api/orders/[id]
 */
export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'order.view')) {
      return NextResponse.json({ success: false, message: 'Bạn không có quyền xem đơn hàng' }, { status: 403 });
    }

    const { id } = params;
    const order = await queryOne(
      `SELECT o.*, 
              u.full_name AS created_by_name, u.username AS created_by_username,
              p.description AS product_description, p.category_id,
              c.name AS category_name
       FROM orders o
       LEFT JOIN users u ON o.created_by = u.id
       LEFT JOIN products p ON o.product_id = p.id
       LEFT JOIN product_categories c ON p.category_id = c.id
       WHERE o.id = ?`,
      [id]
    );

    if (!order) {
      return NextResponse.json({ success: false, message: 'Đơn hàng không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/orders/[id]
 * Cập nhật đơn hàng (số lượng, trạng thái, ghi chú...)
 */
export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'order.edit')) {
      return NextResponse.json({ success: false, message: 'Bạn không có quyền chỉnh sửa đơn hàng' }, { status: 403 });
    }

    const { id } = params;
    const existing = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Đơn hàng không tồn tại' }, { status: 404 });
    }

    const body = await request.json();
    const { quantity, status, customer_name, phone, note, unit_price } = body;

    let updatedQty = existing.quantity;
    if (quantity !== undefined) {
      const q = parseInt(quantity, 10);
      if (isNaN(q) || q <= 0) {
        return NextResponse.json({ success: false, message: 'Số lượng phải lớn hơn 0' }, { status: 400 });
      }
      updatedQty = q;
    }

    const updatedPrice = unit_price !== undefined ? parseFloat(unit_price) : parseFloat(existing.unit_price);
    const updatedTotal = updatedPrice * updatedQty;

    const updatedStatus = status || existing.status;
    const updatedCustomer = customer_name !== undefined ? customer_name : existing.customer_name;
    const updatedPhone = phone !== undefined ? phone : existing.phone;
    const updatedNote = note !== undefined ? note : existing.note;

    await query(
      `UPDATE orders 
       SET quantity = ?, unit_price = ?, total_amount = ?, status = ?, customer_name = ?, phone = ?, note = ?
       WHERE id = ?`,
      [updatedQty, updatedPrice, updatedTotal, updatedStatus, updatedCustomer, updatedPhone, updatedNote, id]
    );

    return NextResponse.json({
      success: true,
      message: 'Cập nhật đơn hàng thành công',
      order: {
        id: parseInt(id, 10),
        order_code: existing.order_code,
        quantity: updatedQty,
        unit_price: updatedPrice,
        total_amount: updatedTotal,
        status: updatedStatus
      }
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/orders/[id]
 */
export async function DELETE(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'order.delete')) {
      return NextResponse.json({ success: false, message: 'Bạn không có quyền xóa đơn hàng' }, { status: 403 });
    }

    const { id } = params;
    const existing = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Đơn hàng không tồn tại' }, { status: 404 });
    }

    await query('DELETE FROM orders WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: `Đã xóa đơn hàng [${existing.order_code}] thành công`
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
