import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const vastUrl = searchParams.get('url');

        if (!vastUrl) {
            return NextResponse.json(
                { error: 'VAST URL is required' },
                { status: 400 }
            );
        }

        console.log('Fetching raw VAST from:', vastUrl);

        const response = await fetch(vastUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Video Ad Player)',
                'Accept': 'application/xml, text/xml, */*'
            },
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xmlText = await response.text();

        return NextResponse.json({
            url: vastUrl,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            contentLength: xmlText.length,
            xmlContent: xmlText
        });

    } catch (error) {
        console.error('Debug VAST error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch VAST data', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
