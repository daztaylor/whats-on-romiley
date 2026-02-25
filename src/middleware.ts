import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Platform Admin routes: auth disabled for local dev ---
    // (Re-enable cookie check here when needed for production)
    if (pathname.startsWith('/platform') && !pathname.startsWith('/platform/login')) {
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
