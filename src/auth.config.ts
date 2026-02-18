import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/platform/login', // Default sign-in page, though we have two
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isPlatformRoute = nextUrl.pathname.startsWith('/platform');
            const isAdminRoute = nextUrl.pathname.startsWith('/admin');

            if (isPlatformRoute) {
                if (isLoggedIn && auth?.user?.role === 'admin') return true;
                return false; // Redirect unauthenticated or unauthorized users
            }

            if (isAdminRoute) {
                if (isLoggedIn) return true; // Both admin and venue can access /admin
                return false;
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.venueId = user.venueId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.venueId = token.venueId as string | undefined;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
