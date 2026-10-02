import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Static and public routes that bypass auth
  const isPublicRoute =
    pathname === '/login' ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico';

  const token = request.cookies.get('auth_token')?.value;
  const hasValidToken = Boolean(token && token.trim().length > 10);

  // 1. If not logged in and accessing protected page -> redirect to /login
  if (!isPublicRoute && !hasValidToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already logged in and visiting /login -> move directly to dashboard (/)
  if (pathname === '/login' && hasValidToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
