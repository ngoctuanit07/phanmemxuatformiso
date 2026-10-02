export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, queryOne, withTransaction } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'user.manage') && !hasPermission(currentUser, 'role.manage')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền quản lý phân quyền người dùng' }, { status: 403 });
    }

    const userId = params.id;

    // Get user with role info
    const user = await queryOne(
      `SELECT u.id, u.username, u.full_name, u.role_id, r.name AS role_name, r.code AS role_code
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'Người dùng không tồn tại' }, { status: 404 });
    }

    // All available permissions grouped by module
    const allPermissions = await query(`SELECT * FROM permissions ORDER BY module ASC, id ASC`);

    // Permissions inherited from role
    const rolePermissions = await query(
      `SELECT permission_id FROM role_permissions WHERE role_id = ?`,
      [user.role_id]
    );
    const rolePermIds = rolePermissions.map(rp => rp.permission_id);

    // Direct permissions specifically granted to this user
    const directUserPermissions = await query(
      `SELECT permission_id FROM user_permissions WHERE user_id = ?`,
      [userId]
    );
    const directPermIds = directUserPermissions.map(up => up.permission_id);

    return NextResponse.json({
      success: true,
      user,
      all_permissions: allPermissions,
      role_permission_ids: rolePermIds,
      user_permission_ids: directPermIds
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải phân quyền người dùng' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (!hasPermission(currentUser, 'user.manage') && !hasPermission(currentUser, 'role.manage')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền chỉnh sửa phân quyền người dùng' }, { status: 403 });
    }

    const userId = params.id;
    const { permission_ids } = await request.json();

    if (!Array.isArray(permission_ids)) {
      return NextResponse.json({ success: false, message: 'Danh sách quyền không hợp lệ' }, { status: 400 });
    }

    // Save direct user permissions inside a transaction
    await withTransaction(async (conn) => {
      await conn.execute(`DELETE FROM user_permissions WHERE user_id = ?`, [userId]);
      for (const pId of permission_ids) {
        await conn.execute(`INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)`, [userId, pId]);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật phân quyền module cho người dùng thành công!'
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật phân quyền người dùng' }, { status: 500 });
  }
}
