import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Platform Admin routes: protected by custom cookie ---
    if (pathname.startsWith('/platform') && !pathname.startsWith('/platform/login')) {
        const platformAdminCookie = request.cookies.get('platform_admin');
        if (!platformAdminCookie || platformAdminCookie.value !== 'true') {
            return NextResponse.redirect(new URL('/platform/login', request.url));
        }
        return NextResponse.next();
    }

    // --- Venue Admin routes: protected by NextAuth session cookie ---
    // We check for the NextAuth session cookie directly to avoid importing
    // the full NextAuth library (which exceeds the 1MB Edge Function limit).
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const sessionCookie =
            request.cookies.get('__Secure-next-auth.session-token') ||
            request.cookies.get('next-auth.session-token');
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
