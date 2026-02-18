import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

async function getUser(email: string) {
    try {
        const user = await prisma.venue.findUnique({ where: { ownerEmail: email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            id: 'credentials', // Default provider ID
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                is_admin: { label: "Hidden Admin Flag", type: "hidden" }
            },
            async authorize(credentials) {
                // 1. Check if trying to login as Master Admin
                if (credentials?.is_admin === 'true') {
                    const masterPassword = process.env.MASTER_ADMIN_PASSWORD;
                    if (!masterPassword) {
                        throw new Error('Server configuration error: MASTER_ADMIN_PASSWORD not set');
                    }
                    if (credentials.password === masterPassword) {
                        return {
                            id: 'admin',
                            name: 'Platform Admin',
                            email: 'admin@platform.com',
                            role: 'admin'
                        };
                    }
                    return null;
                }

                // 2. Check Venue Login
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.ownerEmail,
                            role: 'venue',
                            venueId: user.id
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
