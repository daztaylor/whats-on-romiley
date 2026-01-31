'use client'

import { useState, useTransition } from 'react'
import { changePassword } from '@/app/actions/change-password'

export default function ChangePasswordPage() {
    const [isPending, startTransition] = useTransition()
    const [state, setState] = useState<any>(null)

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await changePassword(null, formData)
            setState(result)
        })
    }

    return (
        <div className="container p-2">
            <h1 className="mb-2">Change Password</h1>

            <div className="card" style={{ maxWidth: '500px' }}>
                <form action={handleSubmit}>
                    {state?.error && (
                        <div style={{
                            padding: '1rem',
                            background: '#fee',
                            border: '1px solid #fcc',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            color: '#c00'
                        }}>
                            {state.error}
                        </div>
                    )}

                    {state?.success && (
                        <div style={{
                            padding: '1rem',
                            background: '#efe',
                            border: '1px solid #cfc',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            color: '#060'
                        }}>
                            {state.message}
                        </div>
                    )}

                    <div className="mb-2">
                        <label className="text-sm">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            className="input w-full"
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label className="text-sm">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            className="input w-full"
                            minLength={8}
                            required
                        />
                        <small style={{ opacity: 0.7 }}>Minimum 8 characters</small>
                    </div>

                    <div className="mb-2">
                        <label className="text-sm">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="input w-full"
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        disabled={isPending}
                    >
                        {isPending ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
