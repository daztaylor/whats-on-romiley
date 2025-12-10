import { prisma } from '@/lib/prisma';
import EventCard from '@/components/EventCard';

export const dynamic = 'force-dynamic';

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
    <div>
      <section className="hero">
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 800 }}>
          What's On in Romiley
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '2rem' }}>
          Discover the best local events in Romiley, Stockport. From pub quizzes to live music.
        </p>

        <form action="/events" className="search-bar">
          <input
            type="text"
            name="q"
            placeholder="Search events (e.g., 'quiz', 'jazz')..."
            className="input"
          />
          <button type="submit" className="btn">Search</button>
        </form>
      </section>

      <section className="container p-2">
        <div className="flex-between mb-2">
          <h2 style={{ fontSize: '2rem' }}>Upcoming Events</h2>
          <a href="/events" style={{ color: 'var(--secondary)' }}>View All &rarr;</a>
        </div>

        {events.length === 0 ? (
          <p className="text-center" style={{ color: '#666' }}>No upcoming events found.</p>
        ) : (
          <div className="grid grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="container p-2" style={{ borderTop: '1px solid var(--card-border)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          For Venue Owners
        </h2>
        <div className="card text-center" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--card-bg)' }}>
          <h3 style={{ marginBottom: '1rem' }}>List Your Events for Free</h3>
          <p style={{ marginBottom: '1.5rem', color: '#ccc' }}>
            Reach thousands of locals. Automate your social media. Update in seconds.
          </p>
          <div>
            <a href="/admin" className="btn btn-secondary">Get Started</a>
          </div>
        </div>
      </section>
    </div>
  );
}
