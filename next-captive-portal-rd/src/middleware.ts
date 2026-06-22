import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/',
    '/splash',
    '/welcome',
    "/api(.*)",
    "/checkout(.*)",
    "/dashboard(.*)",
    '/sign-in(.*)',
    '/terms-and-conditions(.*)',
    // Allow "/[subvenue] pages" (but NOT /admin)
    "/:subvenue((?!admin).*)",
    // '/sign-up(.*)',
])

// Routes that require PayFast configuration
const isPaymentRoute = createRouteMatcher([
    '/checkout(.*)',
    '/admin/packages(.*)',
])

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
