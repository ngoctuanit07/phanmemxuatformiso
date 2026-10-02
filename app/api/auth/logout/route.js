import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Đã đăng xuất thành công' });
  response.cookies.set('auth_token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0
  });
  return response;
}
