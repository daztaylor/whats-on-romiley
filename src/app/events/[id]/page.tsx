import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id },
        include: { venue: true },
    });

    if (!event) {
        return (
            <div className="container p-2 text-center">
                <h1>Event Not Found</h1>
                <Link href="/events" className="btn mt-2">Back to Events</Link>
            </div>
        );
    }

    return (
        <div className="container p-2">
            <Link href="/events" style={{ color: '#999', marginBottom: '1rem', display: 'inline-block' }}>
                &larr; Back to Events
            </Link>

            <div className="card" style={{ padding: '3rem', marginTop: '1rem' }}>
                <div className="flex-between">
                    <span className="tag" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>{event.category}</span>
                    <span style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
                        {new Date(event.date).toLocaleDateString(undefined, {
                            weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>

                <h1 style={{ fontSize: '3rem', margin: '1rem 0' }}>{event.title}</h1>

                <div style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#ddd', marginBottom: '2rem' }}>
                    {event.description}
                </div>

                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Venue</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{event.venue.name}</p>
                    <p style={{ color: '#999' }}>📍 {event.venue.location}</p>
                    <p style={{ color: '#999' }}>Type: {event.venue.type}</p>

                    {/* Map Placeholder or Link */}
                    {/* Map Placeholder or Link */}
                    {event.bookingUrl ? (
                        <a
                            href={event.bookingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary mt-2"
                            style={{ fontSize: '0.9rem', color: '#fff', border: '1px solid var(--primary)' }}
                        >
                            Visit Website / Book Tickets
                        </a>
                    ) : (
                        <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(event.venue.name + ' ' + event.venue.location)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary mt-2"
                            style={{ fontSize: '0.9rem' }}
                        >
                            Get Directions
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
