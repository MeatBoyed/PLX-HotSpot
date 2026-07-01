import { NextRequest, NextResponse } from 'next/server'

// Routes that require PayFast configuration
function isPaymentRoute(pathname: string): boolean {
    return pathname.startsWith('/checkout')
}

// Check if PayFast is configured (checks if merchant ID and key are set)
function isPayFastConfigured(): boolean {
    const merchantId = process.env.PAYFAST_MERCHANT_ID
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY
    return !!(merchantId?.trim() && merchantKey?.trim())
}

export default function middleware(req: NextRequest) {
    if (isPaymentRoute(req.nextUrl.pathname) && !isPayFastConfigured()) {
        const url = req.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }
    return NextResponse.next()
}

export const config = {
    matcher: [
        // Skip Next internals and static files
        '/((?!.*\\..*|_next).*)',
        '/(api|trpc)(.*)',
    ],
}
