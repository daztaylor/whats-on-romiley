import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import DashboardClient from './client';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const cookieStore = await cookies();
    const venueId = cookieStore.get('venue_id')?.value;

    if (!venueId) return null; // Middleware should catch this

    const events = await prisma.event.findMany({
        where: { venueId },
        orderBy: { date: 'asc' },
    });

    return <DashboardClient events={events} />;
}
