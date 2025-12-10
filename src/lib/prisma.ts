import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

function createPrismaClient() {
    // Check if we're using Turso (libsql://) or local SQLite (file:)
    const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

    if (databaseUrl.startsWith('libsql://')) {
        // Production: Use Turso with adapter
        const libsql = createClient({ url: databaseUrl })
        const adapter = new PrismaLibSql(libsql as any)
        return new PrismaClient({ adapter: adapter as any })
    } else {
        // Development: Use local SQLite
        return new PrismaClient()
    }
}

// Lazy initialization - create client on first access
export const prisma = new Proxy({} as PrismaClient, {
    get(target, prop) {
        if (!globalForPrisma.prisma) {
            globalForPrisma.prisma = createPrismaClient()
        }
        return (globalForPrisma.prisma as any)[prop]
    }
})

