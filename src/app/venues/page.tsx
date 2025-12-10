import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function VenuesPage() {
    const venues = await prisma.venue.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { events: true } } }
    });

    return (
        <div className="container p-2">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Local Venues</h1>

            <div className="grid grid-cols-3">
                {venues.map((venue) => (
                    <div key={venue.id} className="card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{venue.name}</h2>
                        <span className="tag" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>{venue.type}</span>
                        <p style={{ color: '#ccc', marginBottom: '1rem' }}>📍 {venue.location}</p>
                        <p style={{ fontSize: '0.9rem', color: '#999' }}>
                            Upcoming Events: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{venue._count.events}</span>
                        </p>
                        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                            <Link href={`/events?q=${encodeURIComponent(venue.name)}`} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                                View Events
                            </Link>
                        </div>
                    </div>
                ))}

                {venues.length === 0 && (
                    <p>No venues found.</p>
                )}
            </div>
        </div>
    );
}
