import { prisma } from '@/lib/prisma';
import VenueManagerClient from './client';

export const dynamic = 'force-dynamic';

export default async function VenueManagerPage() {
    const venues = await prisma.venue.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { events: true }
            }
        }
    });

    return (
        <VenueManagerClient venues={venues} />
    );
}
