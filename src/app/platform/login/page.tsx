'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/actions/auth';

export default function PlatformLoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', border: '1px solid var(--secondary)' }}>
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Super Admin</h1>

                <form action={dispatch} className="flex flex-col" style={{ gap: '1rem' }}>
                    {/* Hidden flag to tell auth.ts this is an admin login */}
                    <input type="hidden" name="is_admin" value="true" />

                    {/* Dummy email for credentials provider requirement, or handled in authorize */}
                    <input type="hidden" name="email" value="admin@platform.com" />

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Master Password</label>
                        <input name="password" type="password" required className="input" style={{ width: '100%' }} />
                    </div>

                    {errorMessage && (
                        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>{errorMessage}</p>
                    )}

                    <button type="submit" className="btn mt-2" style={{ width: '100%', backgroundColor: 'var(--secondary)' }}>
                        Enter Console
                    </button>
                </form>
            </div>
        </div>
    );
}
