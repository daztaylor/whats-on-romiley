import { prisma } from '@/lib/prisma';
import PlatformDashboardClient from './client';

export const dynamic = 'force-dynamic';

export default async function PlatformDashboard() {
    // Fetch ALL upcoming events
    const events = await prisma.event.findMany({
        where: {
            date: { gte: new Date() }
        },
        include: { venue: true },
        orderBy: { date: 'asc' },
    });

    return <PlatformDashboardClient events={events} />;
}
