import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="container flex-between">
                <Link href="/" className="logo">
                    What's On in Romiley
                </Link>
                <div className="flex items-center" style={{ gap: '2rem' }}>
                    <Link href="/events" style={{ textDecoration: 'none', fontWeight: 500 }}>Events</Link>
                    <Link href="/venues" style={{ textDecoration: 'none', fontWeight: 500 }}>Venues</Link>
                    <Link href="/admin" className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        For Business
                    </Link>
                </div>
            </div>
        </nav>
    );
}
