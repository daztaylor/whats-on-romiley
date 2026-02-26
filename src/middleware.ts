import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Platform Admin routes ---
    if (pathname.startsWith('/platform')) {
        return NextResponse.next();
    }

    // --- Venue Admin routes ---
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        // Skip auth check in local development
        if (process.env.NODE_ENV === 'development') {
            return NextResponse.next();
        }

        const sessionCookie =
            request.cookies.get('__Secure-next-auth.session-token') ||
            request.cookies.get('next-auth.session-token');
        const platformAdminCookie = request.cookies.get('platform_admin');

        if (!sessionCookie && !platformAdminCookie) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
