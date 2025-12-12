import { prisma } from '@/lib/prisma';
import EventCard from '@/components/EventCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EventsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string; date?: string }>;
}) {
    const { q, category, date } = await searchParams;

    const where: any = {
        date: { gte: new Date() },
    };

    // Date Filtering Logic
    if (date) {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const endOfToday = new Date(now.setHours(23, 59, 59, 999));

        switch (date) {
            case 'today':
                where.date = {
                    gte: startOfToday,
                    lte: endOfToday
                };
                break;
            case 'week':
                const endOfWeek = new Date(now);
                endOfWeek.setDate(now.getDate() + 7);
                where.date = {
                    gte: startOfToday,
                    lte: endOfWeek
                };
                break;
            case 'month':
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                where.date = {
                    gte: startOfToday,
                    lte: endOfMonth
                };
                break;
            default:
                // Default to future events only (already set above)
                break;
        }
    }

    if (q) {
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { venue: { name: { contains: q, mode: 'insensitive' } } }
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

                {/* Filter Bar */}
                <div className="card p-2 mb-2" style={{ background: 'var(--card-bg)' }}>
                    <form action="/events" className="flex items-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>

                        {/* Search */}
                        <div style={{ flex: 2, minWidth: '200px' }}>
                            <input
                                type="text"
                                name="q"
                                defaultValue={q}
                                placeholder="Search events, venues..."
                                className="input w-full"
                            />
                        </div>

                        {/* Date Filter */}
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <select name="date" className="input w-full" defaultValue={date || ''}>
                                <option value="">Any Date</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <select name="category" className="input w-full" defaultValue={category || ''}>
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.category} value={c.category}>{c.category}</option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="btn btn-secondary">Filter</button>

                        {(q || category || date) && (
                            <a href="/events" className="btn btn-sm btn-ghost" style={{ textDecoration: 'none' }}>
                                Clear
                            </a>
                        )}
                    </form>
                </div>
            </header>

            {events.length === 0 ? (
                <div className="text-center p-2" style={{ padding: '4rem 0' }}>
                    <h3 style={{ marginBottom: '1rem' }}>No events found</h3>
                    <p style={{ opacity: 0.7 }}>Try adjusting your filters or search terms.</p>
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
