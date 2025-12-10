import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

declare global {
    var prisma: PrismaClient | undefined
}

function getPrismaClient() {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not defined')
    }

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

// In production, always create a new client to ensure env vars are read
// In development, reuse the client to avoid connection issues
export const prisma =
    process.env.NODE_ENV === 'production'
        ? getPrismaClient()
        : (global.prisma || (global.prisma = getPrismaClient()))
