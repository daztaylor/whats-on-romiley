import { prisma } from '@/lib/prisma';
import PlatformDashboardClient from './client';

export const dynamic = 'force-dynamic';

export default async function PlatformDashboard() {
    const [events, savedBackgrounds] = await Promise.all([
        prisma.event.findMany({
            where: { date: { gte: new Date() } },
            include: { venue: true },
            orderBy: { date: 'asc' },
        }),
        prisma.media.findMany({
            where: { type: 'background' },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    return <PlatformDashboardClient events={events} savedBackgrounds={savedBackgrounds} />;
}
