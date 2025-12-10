import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

let prismaInstance: PrismaClient | null = null

function createPrismaClient(): PrismaClient {
    const url = process.env.DATABASE_URL

    console.log('[Prisma] Creating client...')
    console.log('[Prisma] DATABASE_URL exists:', !!url)
    console.log('[Prisma] DATABASE_URL type:', typeof url)
    console.log('[Prisma] DATABASE_URL value:', url ? `${url.substring(0, 30)}...` : 'UNDEFINED')
    console.log('[Prisma] All env keys:', Object.keys(process.env).filter(k => k.includes('DATABASE')))

    if (!url || url === 'undefined' || url === '') {
        throw new Error(`DATABASE_URL is not available. Value: "${url}", Type: ${typeof url}`)
    }

    if (url.startsWith('libsql://')) {
        console.log('[Prisma] Using Turso adapter')
        const libsql = createClient({ url })
        const adapter = new PrismaLibSql(libsql as any)
        return new PrismaClient({ adapter: adapter as any })
    }

    console.log('[Prisma] Using standard SQLite client')
    return new PrismaClient()
}

export const prisma = new Proxy({} as PrismaClient, {
    get(_, prop) {
        if (!prismaInstance) {
            console.log(`[Prisma] First access to property: ${String(prop)}`)
            prismaInstance = createPrismaClient()
        }
        const value = (prismaInstance as any)[prop]
        return typeof value === 'function' ? value.bind(prismaInstance) : value
    }
})
