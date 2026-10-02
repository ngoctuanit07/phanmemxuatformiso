export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(user, 'user.view')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền xem danh sách người dùng' }, { status: 403 });
    }

    const users = await query(
      `SELECT u.id, u.username, u.full_name, u.email, u.phone, u.department, u.role_id, u.status, u.created_at,
              r.name AS role_name, r.code AS role_code
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.id ASC`
    );

    const roles = await query(`SELECT id, name, code FROM roles ORDER BY id ASC`);

    return NextResponse.json({ success: true, users, roles });
  } catch (error) {
    console.error('Error in users API GET:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh sách người dùng' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(currentUser, 'user.manage')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền tạo tài khoản người dùng' }, { status: 403 });
    }

    const { username, password, full_name, email, phone, department, role_id, status } = await request.json();

    if (!username || !password || !full_name) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đủ Tên đăng nhập, Mật khẩu và Họ tên' }, { status: 400 });
    }

    const cleanUsername = String(username).trim();
    if (cleanUsername.length < 3) {
      return NextResponse.json({ success: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ success: false, message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự' }, { status: 400 });
    }

    const existing = await queryOne(`SELECT id FROM users WHERE username = ?`, [cleanUsername]);
    if (existing) {
      return NextResponse.json({ success: false, message: 'Tên đăng nhập này đã tồn tại' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (username, password_hash, full_name, email, phone, department, role_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cleanUsername, hash, full_name.trim(), email || null, phone || null, department || null, role_id || 3, status || 'active']
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Tạo tài khoản thành công!' });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tạo tài khoản' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(currentUser, 'user.manage')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền sửa thông tin người dùng' }, { status: 403 });
    }

    const { id, full_name, email, phone, department, role_id, status, password } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID người dùng' }, { status: 400 });
    }

    if (password && password.trim() !== '') {
      if (password.trim().length < 6) {
        return NextResponse.json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' }, { status: 400 });
      }
      const hash = await bcrypt.hash(password.trim(), 10);
      await query(
        `UPDATE users
         SET full_name = ?, email = ?, phone = ?, department = ?, role_id = ?, status = ?, password_hash = ?
         WHERE id = ?`,
        [full_name, email, phone, department, role_id, status, hash, id]
      );
    } else {
      await query(
        `UPDATE users
         SET full_name = ?, email = ?, phone = ?, department = ?, role_id = ?, status = ?
         WHERE id = ?`,
        [full_name, email, phone, department, role_id, status, id]
      );
    }

    return NextResponse.json({ success: true, message: 'Cập nhật tài khoản thành công!' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật tài khoản' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }
    if (!hasPermission(currentUser, 'user.manage')) {
      return NextResponse.json({ success: false, message: 'Từ chối: Bạn không có quyền xóa người dùng' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID người dùng cần xóa' }, { status: 400 });
    }

    const targetId = parseInt(id, 10);
    if (targetId === currentUser.id) {
      return NextResponse.json({ success: false, message: 'Không thể tự xóa tài khoản của chính mình đang đăng nhập' }, { status: 400 });
    }

    const user = await queryOne(`SELECT username FROM users WHERE id = ?`, [targetId]);
    if (user && user.username === 'admin') {
      return NextResponse.json({ success: false, message: 'Không thể xóa tài khoản Quản trị viên tối cao (admin)' }, { status: 400 });
    }

    await query(`DELETE FROM users WHERE id = ?`, [targetId]);
    return NextResponse.json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xóa người dùng' }, { status: 500 });
  }
}
