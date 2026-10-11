import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://tech-crate.onrender.com/api'
).replace(/\/+$/, '');

const LOCAL_BACKEND_URL = 'http://127.0.0.1:5000/api';

async function proxyRequest(request, { params }) {
  try {
    const { path } = await params;
    const subPath = Array.isArray(path) ? path.join('/') : path;
    const { search } = new URL(request.url);

    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    const headers = new Headers();
    // Copy safe client headers
    for (const [key, value] of request.headers.entries()) {
      if (!['host', 'cookie', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let body = null;
    if (!['GET', 'HEAD'].includes(request.method)) {
      body = await request.arrayBuffer();
    }

    const isDev = process.env.NODE_ENV !== 'production';
    const remoteUrl = `${BACKEND_URL}/${subPath}${search}`;
    const localUrl = `${LOCAL_BACKEND_URL}/${subPath}${search}`;

    const candidateUrls = [remoteUrl, localUrl];

    let backendRes = null;
    let lastError = null;

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          method: request.method,
          headers,
          body,
          cache: 'no-store',
        });

        // If the first candidate returned 404 (endpoint not yet deployed), try second candidate
        if (res.status === 404 && candidateUrls.indexOf(url) === 0) {
          backendRes = res;
          continue;
        }

        backendRes = res;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!backendRes) {
      if (lastError) throw lastError;
      return NextResponse.json(
        { error: 'Failed to communicate with backend service' },
        { status: 502 }
      );
    }

    const responseHeaders = new Headers();
    const contentType = backendRes.headers.get('content-type') || 'application/json';
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    const responseData = await backendRes.arrayBuffer();
    return new NextResponse(responseData, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[API Proxy Error]:', err);
    return NextResponse.json(
      { error: 'Failed to communicate with backend service' },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
