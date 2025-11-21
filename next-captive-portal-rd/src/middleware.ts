import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/',
    '/splash',
    "/api(.*)",
    "/checkout(.*)",
    "/dashboard(.*)",
    '/sign-in(.*)',
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
    return !!(merchantId && merchantKey && merchantId.trim() !== '' && merchantKey.trim() !== '')
}

export default clerkMiddleware(async (auth, req) => {
    // Check PayFast configuration for payment routes
    if (isPaymentRoute(req)) {
        if (!isPayFastConfigured()) {
            const url = req.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // Clerk authentication
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next internals and static files
        "/((?!.*\\..*|_next).*)",
        // Optional: run middleware on all API routes
        "/(api|trpc)(.*)",
    ],
};
