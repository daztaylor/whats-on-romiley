import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Protect /admin routes
    if (path.startsWith('/admin')) {
        // Public admin routes
        if (path === '/admin/login') {
            return NextResponse.next()
        }

        const venueId = request.cookies.get('venue_id')?.value

        if (!venueId) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // Protect /platform routes
    if (path.startsWith('/platform')) {
        if (path === '/platform/login') {
            return NextResponse.next()
        }

        // Check specific platform cookie
        const isPlatformAdmin = request.cookies.get('platform_admin')?.value === 'true'

        if (!isPlatformAdmin) {
            return NextResponse.redirect(new URL('/platform/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/platform/:path*'],
}
