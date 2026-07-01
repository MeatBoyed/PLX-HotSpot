import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export interface VastAdData {
    mediaFileUrl: string;
    clickThroughUrl?: string;
    impressionUrls: string[];
    duration?: number;
    title?: string;
}

function parseVastXml(xmlText: string): VastAdData | null {
    try {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            textNodeName: '#text',
            parseAttributeValue: true,
            trimValues: true
        });

        const parsedXml = parser.parse(xmlText);
        console.log('Parsed XML structure:', JSON.stringify(parsedXml, null, 2));

        // Navigate through the VAST structure
        const vast = parsedXml.VAST;
        if (!vast) {
            console.error('No VAST element found');
            return fallbackParseVast(xmlText);
        }

        const ad = vast.Ad;
        if (!ad) {
            console.error('No Ad element found');
            return fallbackParseVast(xmlText);
        }

        // Handle both single ad and array of ads
        const adData = Array.isArray(ad) ? ad[0] : ad;
        const inline = adData.InLine;

        if (!inline) {
            console.error('No InLine element found');
            return fallbackParseVast(xmlText);
        }

        // Extract title
        const title = inline.AdTitle?.['#text'] || inline.AdTitle;

        // Extract creatives
        const creatives = inline.Creatives?.Creative;
        if (!creatives) {
            console.error('No Creative elements found');
            return fallbackParseVast(xmlText);
        }

        const creativeArray = Array.isArray(creatives) ? creatives : [creatives];

        // Find the video creative
        let mediaFileUrl = '';
        let clickThroughUrl = '';
        let duration = 0;

        for (const creative of creativeArray) {
            if (creative.Linear) {
                const linear = creative.Linear;

                // Extract duration
                if (linear.Duration) {
                    const durationText = linear.Duration['#text'] || linear.Duration;
                    if (typeof durationText === 'string') {
                        const parts = durationText.split(':');
                        if (parts.length === 3) {
                            duration = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                        }
                    }
                }

                // Extract media file
                const mediaFiles = linear.MediaFiles?.MediaFile;
                if (mediaFiles) {
                    const mediaFileArray = Array.isArray(mediaFiles) ? mediaFiles : [mediaFiles];
                    // Get the first MP4 file or just the first file
                    const mediaFile = mediaFileArray.find(mf =>
                        mf['@_type']?.includes('mp4') || mf['@_type']?.includes('video')
                    ) || mediaFileArray[0];

                    if (mediaFile) {
                        mediaFileUrl = mediaFile['#text'] || mediaFile;
                    }
                }

                // Extract click-through URL
                const videoClicks = linear.VideoClicks;
                if (videoClicks?.ClickThrough) {
                    clickThroughUrl = videoClicks.ClickThrough['#text'] || videoClicks.ClickThrough;
                }
            }
        }

        if (!mediaFileUrl) {
            console.error('No media file URL found');
            return fallbackParseVast(xmlText);
        }

        // Extract impression URLs
        const impressions = inline.Impression;
        let impressionUrls: string[] = [];

        if (impressions) {
            if (Array.isArray(impressions)) {
                impressionUrls = impressions.map(imp => imp['#text'] || imp).filter(Boolean);
            } else {
                const url = impressions['#text'] || impressions;
                if (url) impressionUrls = [url];
            }
        }

        const result = {
            mediaFileUrl: mediaFileUrl.trim(),
            clickThroughUrl: clickThroughUrl ? clickThroughUrl.trim() : undefined,
            impressionUrls,
            duration: duration > 0 ? duration : undefined,
            title: title ? title.trim() : undefined
        };

        console.log('Extracted VAST data:', result);
        return result;

    } catch (error) {
        console.error('Error parsing VAST XML with XMLParser:', error);
        return fallbackParseVast(xmlText);
    }
}

// Fallback regex-based parser for when XML parsing fails
function fallbackParseVast(xmlText: string): VastAdData | null {
    try {
        console.log('Using fallback regex parser');

        // Extract media file URL using regex
        const mediaFileMatch = xmlText.match(/<MediaFile[^>]*>([^<]+)<\/MediaFile>/i);
        const mediaFileUrl = mediaFileMatch?.[1]?.trim();

        if (!mediaFileUrl) {
            console.error('No media file found in fallback parse');
            return null;
        }

        // Extract click-through URL
        const clickThroughMatch = xmlText.match(/<ClickThrough[^>]*>([^<]+)<\/ClickThrough>/i);
        const clickThroughUrl = clickThroughMatch?.[1]?.trim();

        // Extract duration
        const durationMatch = xmlText.match(/<Duration[^>]*>([^<]+)<\/Duration>/i);
        let duration: number | undefined;
        if (durationMatch?.[1]) {
            const durationText = durationMatch[1].trim();
            const parts = durationText.split(':');
            if (parts.length === 3) {
                duration = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            }
        }

        // Extract title
        const titleMatch = xmlText.match(/<AdTitle[^>]*>([^<]+)<\/AdTitle>/i);
        const title = titleMatch?.[1]?.trim();

        // Extract impression URLs
        const impressionMatches = xmlText.matchAll(/<Impression[^>]*>([^<]+)<\/Impression>/gi);
        const impressionUrls = Array.from(impressionMatches).map(match => match[1]?.trim()).filter(Boolean);

        const result = {
            mediaFileUrl,
            clickThroughUrl,
            impressionUrls,
            duration,
            title
        };

        console.log('Fallback extracted VAST data:', result);
        return result;

    } catch (error) {
        console.error('Error in fallback VAST parsing:', error);
        return null;
    }
}

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

        console.log('Fetching VAST from:', vastUrl);

        // Fetch VAST XML with proper headers
        const response = await fetch(vastUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Video Ad Player)',
                'Accept': 'application/xml, text/xml, */*'
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xmlText = await response.text();
        console.log('VAST XML received, length:', xmlText.length);

        const adData = parseVastXml(xmlText);

        if (!adData) {
            return NextResponse.json(
                { error: 'Failed to parse VAST XML' },
                { status: 400 }
            );
        }

        console.log('Parsed ad data:', adData);

        return NextResponse.json(adData);
    } catch (error) {
        console.error('VAST API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch VAST data', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
