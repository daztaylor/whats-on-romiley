import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

// Don't create client at module load - only when getPrisma() is called
let cachedPrisma: PrismaClient | null = null

export function getPrisma(): PrismaClient {
    if (cachedPrisma) return cachedPrisma

    const url = process.env.DATABASE_URL
    if (!url) {
        throw new Error(`DATABASE_URL is not set. Got: ${url}`)
    }

    if (url.startsWith('libsql://')) {
        const libsql = createClient({ url })
        const adapter = new PrismaLibSql(libsql as any)
        cachedPrisma = new PrismaClient({ adapter: adapter as any })
    } else {
        cachedPrisma = new PrismaClient()
    }

    return cachedPrisma
}

// For backwards compatibility, export as prisma
// But this will call getPrisma() on first access
export const prisma = new Proxy({} as PrismaClient, {
    get(_, prop) {
        const client = getPrisma()
        const value = (client as any)[prop]
        return typeof value === 'function' ? value.bind(client) : value
    }
})
