'use client'

import { useActionState } from 'react'
import { platformLogin } from '@/app/actions/platform-auth'

export default function PlatformLoginPage() {
    const [state, formAction, isPending] = useActionState(platformLogin, null)

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', border: '1px solid var(--secondary)' }}>
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Super Admin</h1>

                <form action={formAction} className="flex flex-col" style={{ gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                        <input name="email" type="email" required className="input" style={{ width: '100%' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input name="password" type="password" required className="input" style={{ width: '100%' }} />
                    </div>

                    {state?.error && (
                        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>{state.error}</p>
                    )}

                    <button type="submit" disabled={isPending} className="btn mt-2" style={{ width: '100%', backgroundColor: 'var(--secondary)' }}>
                        {isPending ? 'Logging in...' : 'Enter Console'}
                    </button>
                </form>
            </div>
        </div>
    )
}
