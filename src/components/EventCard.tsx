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
    const dateStr = new Date(event.date).toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    });

    const timeStr = new Date(event.date).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Link href={`/events/${event.id}`} className="card" style={{ textDecoration: 'none' }}>
            <div style={{ marginBottom: '1rem' }}>
                <span style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--primary)',
                    fontWeight: 700
                }}>
                    {event.category}
                </span>
            </div>

            <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '0.75rem',
                fontWeight: 800,
                lineHeight: 1.2
            }}>
                {event.title}
            </h3>

            <p style={{
                color: 'var(--muted)',
                fontSize: '0.95rem',
                flex: 1,
                marginBottom: '2rem',
                lineHeight: 1.6
            }}>
                {event.description.substring(0, 120)}...
            </p>

            <div className="flex-between" style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.85rem',
                color: '#fff'
            }}>
                <div style={{ fontWeight: 600 }}>By {event.venue.name}</div>
                <div style={{ color: 'var(--muted)' }}>
                    {dateStr} • {timeStr}
                </div>
            </div>
        </Link>
    );
}
