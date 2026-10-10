import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Admin token required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const folder = body.folder || 'techcrate/products';
    const timestamp = Math.round(new Date().getTime() / 1000);

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      // If Cloudinary server-side credentials aren't set in admin/.env,
      // fallback to proxying upload to backend
      return NextResponse.json({
        fallbackToBackend: true,
        message: 'Cloudinary environment variables not configured on admin server; fallback to backend upload proxy.',
      });
    }

    // Generate SHA-1 / SHA-256 Cloudinary signature for secure uploads
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return NextResponse.json({
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
    });
  } catch (err) {
    console.error('[Cloudinary Sign Error]:', err);
    return NextResponse.json({ error: 'Failed to generate signed upload credentials' }, { status: 500 });
  }
}
