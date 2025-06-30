import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/auth-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { voucherCode } = body;

        const result = await authenticateUser(voucherCode);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
