export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'role.manage')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền quản lý vai trò' }, { status: 403 });
    }

    const roles = await query(`SELECT * FROM roles ORDER BY id ASC`);
    const permissions = await query(`SELECT * FROM permissions ORDER BY module ASC, id ASC`);
    const rolePermissions = await query(`SELECT role_id, permission_id FROM role_permissions`);

    // Map permissions per role
    const rolesWithPerms = roles.map(r => {
      const assigned = rolePermissions
        .filter(rp => rp.role_id === r.id)
        .map(rp => rp.permission_id);
      return { ...r, permissions: assigned };
    });

    return NextResponse.json({
      success: true,
      roles: rolesWithPerms,
      all_permissions: permissions
    });
  } catch (error) {
    console.error('Error fetching roles and permissions:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh sách vai trò và phân quyền' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'role.manage')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền chỉnh sửa phân quyền' }, { status: 403 });
    }

    const { role_id, permission_ids } = await request.json();

    if (!role_id || !Array.isArray(permission_ids)) {
      return NextResponse.json({ success: false, message: 'Dữ liệu phân quyền không hợp lệ' }, { status: 400 });
    }

    // Update role permissions within transaction
    await withTransaction(async (conn) => {
      await conn.execute(`DELETE FROM role_permissions WHERE role_id = ?`, [role_id]);
      for (const pId of permission_ids) {
        await conn.execute(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [role_id, pId]);
      }
    });

    return NextResponse.json({ success: true, message: 'Đã lưu cấu hình phân quyền thành công!' });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật cấu hình phân quyền' }, { status: 500 });
  }
}
