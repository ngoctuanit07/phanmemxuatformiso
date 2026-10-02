import { NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { signToken, getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  try {
    // SECURITY CHECK: Impersonation / role switching is strictly forbidden for unauthenticated users
    const currentUser = await getCurrentUser(request);
    const allowDevSwitch = process.env.ENABLE_DEV_SWITCH === 'true' && process.env.NODE_ENV !== 'production';

    if (!allowDevSwitch && (!currentUser || currentUser.role_code !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Từ chối truy cập: Tính năng chuyển tài khoản chỉ dành cho Quản trị viên (Admin)' },
        { status: 403 }
      );
    }

    const { username } = await request.json();

    const user = await queryOne(
      `SELECT u.id, u.username, u.full_name, u.email, u.phone, u.department, u.role_id, u.status,
              r.name AS role_name, r.code AS role_code
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.username = ?`,
      [username || 'admin']
    );

    if (!user) {
      return NextResponse.json({ success: false, message: 'Người dùng không tồn tại' }, { status: 404 });
    }

    const permissions = await query(
      `SELECT p.code
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [user.role_id]
    );

    user.permissions = permissions.map(p => p.code);

    const token = signToken(user);
    const response = NextResponse.json({ success: true, user });

    response.cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Error switching user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
