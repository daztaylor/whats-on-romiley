import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? (() => {
    const url = process.env.DATABASE_URL || 'file:./dev.db'

    if (url.startsWith('libsql://')) {
        const libsql = createClient({ url })
        const adapter = new PrismaLibSql(libsql as any)
        return new PrismaClient({ adapter: adapter as any })
    }

    return new PrismaClient()
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
