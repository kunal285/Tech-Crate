import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://tech-crate.onrender.com/api'
).replace(/\/+$/, '');

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = String(body.username || body.email || '').trim();

    // Call Node.js Backend Auth Endpoint
    const targetUrl = `${BACKEND_URL}/auth/login`;
    const backendRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: identifier,
        email: identifier,
        password: body.password,
        totpCode: body.totpCode,
        recoveryCode: body.recoveryCode,
      }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || data.error?.message || 'Authentication failed' },
        { status: backendRes.status }
      );
    }

    // Two-factor authentication check
    if (data.require2FA) {
      return NextResponse.json(data);
    }

    const token = data.token || data.accessToken;
    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token returned by backend' },
        { status: 500 }
      );
    }

    // Role check: Admin console access requires administrative role
    const userRole = (data.role || data.user?.role || '').toLowerCase();
    const allowedRoles = ['admin', 'super_admin', 'store_manager', 'order_staff', 'support', 'finance'];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Access Denied: You do not have permissions to access the Admin console.' },
        { status: 403 }
      );
    }

    // Set secure httpOnly cookies
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';

    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    cookieStore.set('admin_role', userRole, {
      httpOnly: false, // Accessible to client for instant UI role rendering
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: data._id || data.user?._id,
        name: data.name || data.user?.name,
        email: data.email || data.user?.email,
        role: userRole,
        avatar: data.avatar || data.user?.avatar,
      },
    });
  } catch (err) {
    console.error('[Admin Login Route Error]:', err);
    return NextResponse.json(
      { error: 'Internal server error during authentication proxy' },
      { status: 500 }
    );
  }
}
