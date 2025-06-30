// This is a fallback/test endpoint that provides sample VAST data
// when the external Revive ad server is not accessible
import { NextResponse } from 'next/server';

export async function GET() {
    // Sample VAST data for testing
    const sampleAdData = {
        mediaFileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        clickThroughUrl: 'https://www.pluxnet.co.za',
        impressionUrls: [],
        duration: 10, // 10 seconds for testing
        title: 'PluxNet Fibre - Sample Ad'
    };

    return NextResponse.json(sampleAdData);
}
