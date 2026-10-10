import { NextResponse } from 'next/server';
import { isRouteAllowed } from './constants/permissions';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public assets and Next.js internal paths to bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Static files like favicon.ico, images
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;
  const role = request.cookies.get('admin_role')?.value || 'super_admin';

  // Publicly accessible pages
  const isLoginPage = pathname === '/login' || pathname === '/admin/login';
  const isAccessDeniedPage = pathname === '/access-denied';

  // 1. Unauthenticated users trying to access protected routes -> redirect to /login
  if (!token && !isLoginPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user visiting /login -> redirect to /dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. RBAC validation for protected pages
  if (token && !isLoginPage && !isAccessDeniedPage) {
    const hasPermission = isRouteAllowed(role, pathname);
    if (!hasPermission) {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
