export default function Footer() {
    return (
        <footer style={{ borderTop: '1px solid var(--card-border)', padding: '2rem 0', marginTop: '4rem', textAlign: 'center' }}>
            <p style={{ color: '#999' }}>© 2025 What's On in Romiley. All rights reserved.</p>
            <div className="flex justify-center mt-2" style={{ gap: '2rem', fontSize: '0.9rem' }}>
                <a href="/admin">Partner Login</a>
            </div>
        </footer>
    );
}
