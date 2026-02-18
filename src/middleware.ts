import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Platform Admin routes: protected by custom cookie ---
    if (pathname.startsWith('/platform') && !pathname.startsWith('/platform/login')) {
        const platformAdminCookie = request.cookies.get('platform_admin');
        if (!platformAdminCookie || platformAdminCookie.value !== 'true') {
            return NextResponse.redirect(new URL('/platform/login', request.url));
        }
        return NextResponse.next();
    }

    // --- Venue Admin routes: protected by NextAuth session ---
    if (pathname.startsWith('/admin')) {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
