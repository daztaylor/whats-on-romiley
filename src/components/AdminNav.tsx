'use client'

import Link from 'next/link';
import { logout } from '@/app/actions/auth';

export default function AdminNav() {
    return (
        <div style={{ width: '250px', background: 'var(--card-bg)', borderRight: '1px solid var(--card-border)', padding: '2rem', height: '100%', position: 'fixed', top: 0, left: 0 }}>
            <div style={{ marginBottom: '3rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                Owner Portal
            </div>

            <nav className="flex flex-col" style={{ gap: '1rem' }}>
                <Link href="/admin/dashboard" className="hover-text">Dashboard</Link>
                <Link href="/admin/events/new" className="hover-text">Add Event</Link>
                <Link href="/admin/change-password" className="hover-text">Change Password</Link>
                <div style={{ height: '1px', background: '#333', margin: '1rem 0' }}></div>
                <Link href="/" target="_blank" style={{ fontSize: '0.9rem', color: '#999' }}>View Public Site</Link>

                <form action={logout} style={{ marginTop: 'auto' }}>
                    <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem' }}>
                        Logout
                    </button>
                </form>
            </nav>
        </div>
    );
}
