export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

/**
 * GET /api/orders
 * Lấy danh sách đơn hàng có tìm kiếm và bộ lọc trạng thái
 */
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'order.view')) {
      return NextResponse.json({ success: false, message: 'Bạn không có quyền xem đơn hàng' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'all';

    let sql = `
      SELECT o.id, o.order_code, o.product_id, o.product_code, o.product_name,
             o.quantity, o.unit, o.unit_price, o.total_amount,
             o.customer_name, o.phone, o.note, o.status,
             o.created_by, o.created_at, o.updated_at,
             u.full_name AS created_by_name, u.username AS created_by_username
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status !== 'all') {
      sql += ` AND o.status = ?`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (o.order_code LIKE ? OR o.product_code LIKE ? OR o.product_name LIKE ? OR o.customer_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY o.id DESC`;

    const orders = await query(sql, params);

    // Summary statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) AS total_orders,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_count,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0) AS confirmed_count,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_count,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) AS total_revenue
      FROM orders
    `);

    return NextResponse.json({
      success: true,
      orders,
      stats: statsResult[0] || {}
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Tạo mới đơn hàng
 */
export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'order.create')) {
      return NextResponse.json({ success: false, message: 'Bạn không có quyền tạo đơn hàng' }, { status: 403 });
    }

    const body = await request.json();
    let {
      product_id,
      product_code,
      product_name,
      quantity,
      unit,
      unit_price,
      total_amount,
      customer_name,
      phone,
      note,
      status
    } = body;

    // Validate product name & quantity
    if (!product_name || !product_name.trim()) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập tên sản phẩm' }, { status: 400 });
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return NextResponse.json({ success: false, message: 'Số lượng sản phẩm phải lớn hơn 0' }, { status: 400 });
    }

    // Verify or find product details from DB if not fully provided
    if (product_id) {
      const prod = await queryOne('SELECT id, code, name, unit, price FROM products WHERE id = ?', [product_id]);
      if (prod) {
        product_code = product_code || prod.code;
        product_name = prod.name;
        unit = unit || prod.unit || 'Cái';
        if (unit_price === undefined || unit_price === null) unit_price = prod.price;
      }
    } else if (product_code) {
      const prod = await queryOne('SELECT id, code, name, unit, price FROM products WHERE code = ?', [product_code]);
      if (prod) {
        product_id = prod.id;
        product_name = prod.name;
        unit = unit || prod.unit || 'Cái';
        if (unit_price === undefined || unit_price === null) unit_price = prod.price;
      }
    } else {
      // Lookup product by name
      const prod = await queryOne('SELECT id, code, name, unit, price FROM products WHERE name = ? OR name LIKE ? LIMIT 1', [
        product_name.trim(),
        `%${product_name.trim()}%`
      ]);
      if (prod) {
        product_id = prod.id;
        product_code = prod.code;
        unit = unit || prod.unit || 'Cái';
        if (unit_price === undefined || unit_price === null) unit_price = prod.price;
      } else {
        // Fallback product code
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randStr = Math.floor(100 + Math.random() * 900);
        product_code = `SP-${dateStr}-${randStr}`;
        unit = unit || 'Cái';
        unit_price = unit_price || 0;
      }
    }

    const finalUnitPrice = parseFloat(unit_price) || 0;
    const finalTotalAmount = total_amount ? parseFloat(total_amount) : finalUnitPrice * parsedQty;

    // Generate unique Order Code: ORD-YYYYMMDD-XXXX
    const today = new Date();
    const ymd = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const order_code = `ORD-${ymd}-${randPart}`;

    const orderStatus = status || 'pending';

    const insertResult = await query(
      `INSERT INTO orders 
       (order_code, product_id, product_code, product_name, quantity, unit, unit_price, total_amount, customer_name, phone, note, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_code,
        product_id || null,
        product_code,
        product_name.trim(),
        parsedQty,
        unit || 'Cái',
        finalUnitPrice,
        finalTotalAmount,
        customer_name ? customer_name.trim() : null,
        phone ? phone.trim() : null,
        note ? note.trim() : null,
        orderStatus,
        currentUser.id
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Đơn hàng [${order_code}] đã được tạo thành công!`,
      order: {
        id: insertResult.insertId,
        order_code,
        product_id,
        product_code,
        product_name: product_name.trim(),
        quantity: parsedQty,
        unit: unit || 'Cái',
        unit_price: finalUnitPrice,
        total_amount: finalTotalAmount,
        status: orderStatus
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
