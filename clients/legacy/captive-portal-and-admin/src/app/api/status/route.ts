import { NextResponse } from 'next/server';
import { getAuthState } from '@/lib/auth/auth-service';

export async function GET() {
    try {
        const authState = await getAuthState();
        return NextResponse.json(authState);
    } catch (error) {
        console.error('Status API error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to get status' },
            { status: 500 }
        );
    }
}
