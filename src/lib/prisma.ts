import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

let prismaInstance: PrismaClient | null = null

function getPrismaClient(): PrismaClient {
    if (prismaInstance) {
        return prismaInstance
    }

    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set')
    }

    if (databaseUrl.startsWith('libsql://')) {
        // Turso/Production
        const libsql = createClient({ url: databaseUrl })
        const adapter = new PrismaLibSql(libsql as any)
        prismaInstance = new PrismaClient({ adapter: adapter as any })
    } else {
        // Local SQLite
        prismaInstance = new PrismaClient()
    }

    return prismaInstance
}

// Export a proxy that creates the client on first property access
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const client = getPrismaClient()
        const value = (client as any)[prop]
        return typeof value === 'function' ? value.bind(client) : value
    }
})
