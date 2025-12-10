import { prisma } from '@/lib/prisma';
import EventCard from '@/components/EventCard';

export const dynamic = 'force-dynamic';

export default async function EventsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string }>;
}) {
    const { q, category } = await searchParams; // Awaiting searchParams as it is a promise in Next.js 15+ 

    const where: any = {
        date: { gte: new Date() },
    };

    if (q) {
        where.OR = [
            { title: { contains: q } }, // Case insensitive usually depends on DB collation
            { description: { contains: q } },
            { venue: { name: { contains: q } } }
        ];
    }

    if (category) {
        where.category = category;
    }

    const events = await prisma.event.findMany({
        where,
        orderBy: { date: 'asc' },
        include: { venue: true },
    });

    const categories = await prisma.event.findMany({
        select: { category: true },
        distinct: ['category'],
    });

    return (
        <div className="container p-2">
            <header className="mb-2">
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>All Events</h1>

                {/* Simple Filter Bar */}
                <div className="flex items-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                    <form action="/events" className="flex" style={{ flex: 1 }}>
                        <input
                            type="text"
                            name="q"
                            defaultValue={q}
                            placeholder="Search..."
                            className="input"
                        />
                        <select name="category" className="input" defaultValue={category || ''} style={{ flex: '0 0 150px' }}>
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.category} value={c.category}>{c.category}</option>
                            ))}
                        </select>
                        <button type="submit" className="btn">Filter</button>
                    </form>
                    {(q || category) && (
                        <a href="/events" style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Clear Filters</a>
                    )}
                </div>
            </header>

            {events.length === 0 ? (
                <div className="text-center p-2">
                    <p>No events found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
