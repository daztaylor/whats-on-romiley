'use client'

import { useState, useTransition } from 'react'
import { createEvent } from '@/app/actions/events'

export default function NewEventPage() {
    const [isPending, startTransition] = useTransition()
    const [state, setState] = useState<any>(null)

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await createEvent(null, formData)
            if (result?.error) {
                setState(result)
            }
        })
    }

    return (
        <div style={{ maxWidth: '600px' }}>
            <h1 className="mb-2">Create New Event</h1>

            <div className="card">
                <form action={handleSubmit} className="flex flex-col" style={{ gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Event Title</label>
                        <input name="title" type="text" required className="input" style={{ width: '100%' }} placeholder="e.g. Weekly Pub Quiz" />
                    </div>

                    <div className="flex" style={{ gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date & Time</label>
                            <input name="date" type="datetime-local" required className="input" style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Booking / Website URL (Optional)</label>
                        <input name="bookingUrl" type="url" className="input" style={{ width: '100%' }} placeholder="https://..." />
                    </div>

                    <div className="flex" style={{ gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                            <input name="category" type="text" list="categories" className="input" style={{ width: '100%' }} placeholder="Select or type..." />
                            <datalist id="categories">
                                <option value="Pub Quiz" />
                                <option value="Live Music" />
                                <option value="Food" />
                                <option value="Sport" />
                                <option value="Comedy" />
                            </datalist>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Repeat</label>
                            <select name="recurrence" className="input" style={{ width: '100%' }}>
                                <option value="none">None</option>
                                <option value="weekly">Weekly (12 weeks)</option>
                                <option value="monthly">Monthly (6 months)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                        <textarea name="description" className="input" rows={5} style={{ width: '100%', fontFamily: 'inherit' }} placeholder="Add details about the event..."></textarea>
                    </div>

                    {state?.error && (
                        <p style={{ color: 'var(--secondary)' }}>{state.error}</p>
                    )}

                    <div className="flex" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <a href="/admin/dashboard" className="btn btn-secondary" style={{ marginRight: '1rem' }}>Cancel</a>
                        <button type="submit" disabled={isPending} className="btn">
                            {isPending ? 'Saving...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    )
}
