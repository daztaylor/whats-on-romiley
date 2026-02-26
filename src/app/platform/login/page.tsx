'use client';

import { useActionState } from 'react';
import { redirect } from 'next/navigation';
import { platformLogin } from '@/app/actions/platform-auth';

export default function PlatformLoginPage() {
    if (process.env.NODE_ENV === 'development') {
        redirect('/platform/dashboard');
    }
    const [state, dispatch] = useActionState(platformLogin, null);

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Site Command</h1>
                    <p style={{ opacity: 0.7 }}>Platform Administration Access</p>
                </div>

                <form action={dispatch} className="flex flex-col" style={{ gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Admin Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="input"
                            style={{ width: '100%' }}
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="input"
                            style={{ width: '100%' }}
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.error && (
                        <div style={{
                            background: 'rgba(255, 87, 87, 0.1)',
                            border: '1px solid rgba(255, 87, 87, 0.2)',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            color: '#ff5757',
                            fontSize: '0.85rem'
                        }}>
                            {state.error}
                        </div>
                    )}

                    <button type="submit" className="btn mt-1" style={{ width: '100%', padding: '0.75rem' }}>
                        Enter Command Centre
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <a href="/" style={{ fontSize: '0.85rem', color: 'var(--muted)', textDecoration: 'none' }}>
                        ← Back to Public Site
                    </a>
                </div>
            </div>
        </div>
    );
}
