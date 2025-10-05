import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/lib/services/image-service';

// GET /api/image/[slug]?ssid=... -> returns image binary from branding_image
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params?.slug;
  const ssid = req.nextUrl.searchParams.get('ssid');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  if (!ssid) {
    return NextResponse.json({ error: 'Missing ssid' }, { status: 400 });
  }

  const row = await imageService.getBySlug(ssid, slug);

  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const etag = row.sha256 ? `W/"${row.sha256}"` : undefined;
  const ifNoneMatch = req.headers.get('if-none-match');
  if (etag && ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  // Data is stored as base64 string; decode to binary buffer
  const buffer = Buffer.from(row.dataBase64, 'base64');
  const headers = new Headers();
  headers.set('Content-Type', row.mimeType || 'application/octet-stream');
  if (etag) headers.set('ETag', etag);
  if (row.updatedAt) headers.set('Last-Modified', new Date(row.updatedAt).toUTCString());
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');

  return new NextResponse(buffer, { status: 200, headers });
}
