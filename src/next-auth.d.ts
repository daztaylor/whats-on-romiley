import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: string
            /** The venue ID if applicable. */
            venueId?: string
        } & DefaultSession["user"]
    }

    interface User {
        role?: string
        venueId?: string
    }
}
