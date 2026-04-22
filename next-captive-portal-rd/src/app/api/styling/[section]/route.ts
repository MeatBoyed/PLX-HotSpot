import { NextRequest, NextResponse } from 'next/server';
import { StylingService } from '@/lib/services/styling-service';

type StylingSection = 'textual' | 'colors' | 'buttons' | 'images' | 'venue' | 'advertising';

const VALID_SECTIONS: StylingSection[] = ['textual', 'colors', 'buttons', 'images', 'venue', 'advertising'];

/**
 * GET /api/styling/[section]?ssid=<ssid>
 * Retrieve a specific styling section
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;
    const ssid = req.nextUrl.searchParams.get('ssid');

    if (!ssid) {
      return NextResponse.json({ error: 'Missing ssid query parameter' }, { status: 400 });
    }

    if (!VALID_SECTIONS.includes(section as StylingSection)) {
      return NextResponse.json(
        { error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const sectionData = await StylingService.getSection(ssid, section as StylingSection);

    return NextResponse.json(
      { section, data: sectionData },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/styling/[section]]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch styling section' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/styling/[section]?ssid=<ssid>
 * Update a specific styling section
 * Body: Object with fields for that section
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;
    const ssid = req.nextUrl.searchParams.get('ssid');

    if (!ssid) {
      return NextResponse.json({ error: 'Missing ssid query parameter' }, { status: 400 });
    }

    if (!VALID_SECTIONS.includes(section as StylingSection)) {
      return NextResponse.json(
        { error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updated = await StylingService.updateSection(ssid, section as StylingSection, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/styling/[section]]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update styling section' },
      { status: 500 }
    );
  }
}
