import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/lib/services/image-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ssid = req.nextUrl.searchParams.get('ssid') || '';
  if (!ssid || !slug) {
    return NextResponse.json({ error: 'Missing ssid or slug' }, { status: 400 });
  }

  const image = await imageService.getBySlug(ssid, slug);
  if (!image) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = Buffer.from(image.dataBase64, 'base64');
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': image.mimeType,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}