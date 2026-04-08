'use client'

import { useState, useTransition } from 'react'
import { updateEvent } from '@/app/actions/events'

interface Props {
    event: {
        id: string;
        title: string;
        description: string;
        date: Date;
        category: string;
    },
    isPlatformAdmin?: boolean;
}

export default function EditEventForm({ event, isPlatformAdmin }: Props) {
    const [isPending, startTransition] = useTransition()
    const [state, setState] = useState<any>(null)

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await updateEvent(event.id, null, formData)
            if (result?.error) {
                setState(result)
            }
        })
    }

    // Format date for datetime-local input (YYYY-MM-DDTHH:mm) in Europe/London timezone
    const eventDate = new Date(event.date);
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).formatToParts(eventDate);

    const yr = parts.find(p => p.type === 'year')?.value;
    const mo = parts.find(p => p.type === 'month')?.value;
    const da = parts.find(p => p.type === 'day')?.value;
    const hr = parts.find(p => p.type === 'hour')?.value;
    const mi = parts.find(p => p.type === 'minute')?.value;

    const defaultDate = `${yr}-${mo}-${da}T${hr}:${mi}`;

    return (
        <div className="card">
            <form action={handleSubmit} className="flex flex-col" style={{ gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Event Title</label>
                    <input name="title" defaultValue={event.title} type="text" required className="input" style={{ width: '100%' }} />
                </div>

                <div className="flex" style={{ gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date & Time</label>
                        <input name="date" defaultValue={defaultDate} type="datetime-local" required className="input" style={{ width: '100%' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Booking / Website URL (Optional)</label>
                    <input name="bookingUrl" defaultValue={(event as any).bookingUrl} type="url" className="input" style={{ width: '100%' }} placeholder="https://..." />
                </div>

                <div className="flex" style={{ gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                        <input name="category" defaultValue={event.category} type="text" list="categories" className="input" style={{ width: '100%' }} />
                        <datalist id="categories">
                            <option value="Pub Quiz" />
                            <option value="Live Music" />
                            <option value="Food" />
                            <option value="Sport" />
                            <option value="Comedy" />
                        </datalist>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                    <textarea name="description" defaultValue={event.description} className="input" rows={5} style={{ width: '100%', fontFamily: 'inherit' }}></textarea>
                </div>

                {state?.error && (
                    <p style={{ color: 'var(--secondary)' }}>{state.error}</p>
                )}

                <div className="flex" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <a href={isPlatformAdmin ? "/platform/dashboard" : "/admin/dashboard"} className="btn btn-secondary" style={{ marginRight: '1rem' }}>Cancel</a>
                    <button type="submit" disabled={isPending} className="btn">
                        {isPending ? 'Saving...' : 'Update Event'}
                    </button>
                </div>
            </form>
        </div >
    )
}
