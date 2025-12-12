import Link from 'next/link';

interface EventCardProps {
    event: {
        id: string;
        title: string;
        description: string;
        date: Date;
        category: string;
        venue: {
            name: string;
            location: string;
        };
    };
}

export default function EventCard({ event }: EventCardProps) {
    const dateObj = new Date(event.date);
    const dayStr = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
    const dateNum = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return (
        <Link href={`/events/${event.id}`} className="card" style={{ textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
            {/* Top Bar: Date & Category */}
            <div className="flex-between mb-1">
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                }}>
                    <span style={{ color: 'var(--primary)' }}>{dayStr}</span>
                    <span>{dateNum}</span>
                    <span style={{ opacity: 0.5 }}>|</span>
                    <span>{timeStr}</span>
                </div>

                <span style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--muted)',
                    fontWeight: 600
                }}>
                    {event.category}
                </span>
            </div>

            {/* Main Content: Title */}
            <h3 style={{
                fontSize: '1.4rem',
                marginTop: '1rem',
                marginBottom: '0.5rem',
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#fff'
            }}>
                {event.title}
            </h3>

            {/* Location / Venue - Prominent */}
            <div style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--primary)',
                fontSize: '0.9rem',
                fontWeight: 600
            }}>
                <span>📍</span>
                <span>{event.venue.name}</span>
            </div>

            {/* Description */}
            <p style={{
                color: 'var(--muted)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                flex: 1,
                marginBottom: '1rem',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
            }}>
                {event.description}
            </p>

            {/* Bottom Action */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'right',
                fontSize: '0.85rem',
                color: 'var(--secondary)',
                fontWeight: 600
            }}>
                View Details →
            </div>
        </Link>
    );
}
