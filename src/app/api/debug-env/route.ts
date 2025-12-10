export const dynamic = 'force-dynamic'

export async function GET() {
    const dbUrl = process.env.DATABASE_URL

    return Response.json({
        hasDbUrl: !!dbUrl,
        dbUrlPrefix: dbUrl ? dbUrl.substring(0, 20) : 'undefined',
        nodeEnv: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('PLATFORM'))
    })
}
