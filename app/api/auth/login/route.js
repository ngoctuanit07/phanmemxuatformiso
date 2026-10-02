export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne, query } from '@/lib/db';
import { signToken } from '@/lib/auth';

// In-memory rate limiting map for login attempts: key -> { count, lockUntil }
const loginAttempts = new Map();
const MAX_ATTEMPTS = 10;
const LOCKOUT_WINDOW = 15 * 60 * 1000; // 15 minutes

function getClientIdentifier(request, username) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  return `${ip}_${username.toLowerCase()}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu hợp lệ' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const rateLimitKey = getClientIdentifier(request, cleanUsername);
    const now = Date.now();
    const attemptRecord = loginAttempts.get(rateLimitKey);

    if (attemptRecord && attemptRecord.lockUntil && now < attemptRecord.lockUntil) {
      const minutesLeft = Math.ceil((attemptRecord.lockUntil - now) / 60000);
      return NextResponse.json(
        {
          success: false,
          message: `Tài khoản tạm thời bị khóa do nhập sai nhiều lần. Vui lòng thử lại sau ${minutesLeft} phút.`
        },
        { status: 429 }
      );
    }

    const user = await queryOne(
      `SELECT u.id, u.username, u.password_hash, u.full_name, u.email, u.phone, u.department, u.role_id, u.status,
              r.name AS role_name, r.code AS role_code
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.username = ?`,
      [cleanUsername]
    );

    // OWASP: Do not differentiate between "user does not exist" and "wrong password"
    const genericAuthError = 'Tên đăng nhập hoặc mật khẩu không chính xác';

    if (!user) {
      // Record failed attempt
      const count = (attemptRecord?.count || 0) + 1;
      loginAttempts.set(rateLimitKey, {
        count,
        lockUntil: count >= MAX_ATTEMPTS ? now + LOCKOUT_WINDOW : 0
      });
      return NextResponse.json({ success: false, message: genericAuthError }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ success: false, message: 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ quản trị viên.' }, { status: 403 });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      const count = (attemptRecord?.count || 0) + 1;
      loginAttempts.set(rateLimitKey, {
        count,
        lockUntil: count >= MAX_ATTEMPTS ? now + LOCKOUT_WINDOW : 0
      });
      return NextResponse.json({ success: false, message: genericAuthError }, { status: 401 });
    }

    // Reset rate limiter upon successful login
    loginAttempts.delete(rateLimitKey);

    // Fetch both role permissions and direct user permissions
    const rolePermissions = await query(
      `SELECT p.code
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [user.role_id]
    );

    const directPermissions = await query(
      `SELECT p.code
       FROM permissions p
       INNER JOIN user_permissions up ON p.id = up.permission_id
       WHERE up.user_id = ?`,
      [user.id]
    );

    const permissionSet = new Set([
      ...rolePermissions.map(p => p.code),
      ...directPermissions.map(p => p.code)
    ]);
    user.permissions = Array.from(permissionSet);

    const token = signToken(user);
    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        role_code: user.role_code,
        role_name: user.role_name
      }
    });

    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Secure Login Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xác thực hệ thống' }, { status: 500 });
  }
}
