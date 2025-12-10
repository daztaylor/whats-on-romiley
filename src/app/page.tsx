import { prisma } from '@/lib/prisma';
import EventCard from '@/components/EventCard';

export const dynamic = 'force-dynamic'

export default async function Home() {
  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: 'asc',
    },
    take: 6,
    include: {
      venue: true,
    },
  });

  return (
    <div className="container p-2">
      <header className="mb-2">
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>What's On in Romiley</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Discover local events happening near you</p>
      </header>

      <section className="mb-2">
        <h2 className="mb-1">Upcoming Events</h2>
        {events.length === 0 ? (
          <p>No upcoming events at the moment. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <div className="text-center mt-2">
        <a href="/events" className="btn">
          View All Events
        </a>
      </div>
    </div>
  );
}
