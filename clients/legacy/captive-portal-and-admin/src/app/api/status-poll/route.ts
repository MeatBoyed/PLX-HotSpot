import { NextRequest, NextResponse } from 'next/server';
import { getMikroTikDataFromCookie } from '@/lib/mikrotik/mikrotik-lib';
import { getUserSession, checkUserUsage } from '@/lib/mikrotik/mikrotik-service';

export async function GET(request: NextRequest) {
    try {
        // Get mikrotik data from cookie
        const mikrotikData = await getMikroTikDataFromCookie();

        if (!mikrotikData) {
            return NextResponse.json({
                success: false,
                message: 'No MikroTik data found'
            }, { status: 401 });
        }

        // Get fresh session and usage data
        const [sessionResult, usageResult] = await Promise.all([
            getUserSession(mikrotikData),
            checkUserUsage(mikrotikData)
        ]);

        if (!sessionResult.success || !sessionResult.data) {
            return NextResponse.json({
                success: false,
                message: sessionResult.message || 'Failed to get session status'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: {
                userSession: sessionResult.data,
                userUsage: usageResult.success ? usageResult : null
            }
        });

    } catch (error) {
        console.error('Status poll error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}
