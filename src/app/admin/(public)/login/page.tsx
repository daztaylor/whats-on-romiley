'use client'

import { useState, useTransition } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
    const [isPending, startTransition] = useTransition()
    const [state, setState] = useState<any>(null)

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await login(null, formData)
            if (result?.error) {
                setState(result)
            }
        })
    }

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Venue Login</h1>

                <form action={handleSubmit} className="flex flex-col" style={{ gap: '1rem' }}>
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

                    <button type="submit" disabled={isPending} className="btn mt-2" style={{ width: '100%' }}>
                        {isPending ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
}
