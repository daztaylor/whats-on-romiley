import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

let prismaInstance: PrismaClient | null = null

function createPrismaClient(): PrismaClient {
    const url = process.env.DATABASE_URL

    if (!url || url === 'undefined' || url === '') {
        throw new Error(`DATABASE_URL is not available. Value: "${url}"`)
    }

    if (url.startsWith('libsql://')) {
        // Extract auth token from URL
        const urlObj = new URL(url)
        const authToken = urlObj.searchParams.get('authToken')
        const baseUrl = url.split('?')[0]

        console.log('[Prisma] Creating Turso client with URL:', baseUrl.substring(0, 30) + '...')
        console.log('[Prisma] Auth token exists:', !!authToken)

        // Pass URL and authToken separately to avoid env var issues
        const libsql = createClient({
            url: baseUrl,
            authToken: authToken || undefined
        })

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
