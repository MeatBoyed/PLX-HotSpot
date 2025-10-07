import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/', '/splash', '/sign-in(.*)', '/sign-up(.*)', "/checkout(.*)", "/dashboard(.*)"])

export default clerkMiddleware(async (auth, req) => {
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
