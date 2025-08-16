// This endpoint allows the status template to send periodic updates
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const formData = await request.formData();
    const mikrotikStatusData = Object.fromEntries(formData.entries());

    // Save Mikrotik Status data to cookie
    (await cookies()).set('mikrotik-status', JSON.stringify(mikrotikStatusData), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 50, // 50 minutes
    });

    // Return a simple JSON response
    return NextResponse.json({ success: true });
}
