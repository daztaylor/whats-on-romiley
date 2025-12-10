import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

let prismaInstance: PrismaClient | null = null

function createPrismaClient(): PrismaClient {
    // Check if we're in a build/prerender context
    const url = process.env.DATABASE_URL

    // During build, DATABASE_URL might not be available - return a dummy client
    if (!url || url === 'undefined') {
        console.warn('DATABASE_URL not available, creating placeholder client')
        // Return a basic client that will fail gracefully
        return new PrismaClient()
    }

    console.log(`Creating Prisma client with URL starting with: ${url.substring(0, 20)}...`)

    if (url.startsWith('libsql://')) {
        const libsql = createClient({ url })
        const adapter = new PrismaLibSql(libsql as any)
        return new PrismaClient({ adapter: adapter as any })
    }

    return new PrismaClient()
}

export const prisma = new Proxy({} as PrismaClient, {
    get(_, prop) {
        if (!prismaInstance) {
            prismaInstance = createPrismaClient()
        }
        const value = (prismaInstance as any)[prop]
        return typeof value === 'function' ? value.bind(prismaInstance) : value
    }
})
