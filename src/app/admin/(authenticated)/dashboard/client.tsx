'use client'

import Link from 'next/link';
import { useState } from 'react';
import { deleteEvents } from '@/app/actions/events';

interface Event {
    id: string;
    title: string;
    description: string;
    date: Date;
    category: string;
    venueId: string;
}

export default function DashboardClient({ events }: { events: Event[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    const toggleEvent = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === events.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(events.map(e => e.id)));
        }
    };

    const handleDelete = async () => {
        if (selectedIds.size === 0) {
            alert('Please select at least one event to delete');
            return;
        }

        // Use setTimeout to ensure confirm dialog isn't interrupted
        setTimeout(async () => {
            const confirmed = confirm(`Are you sure you want to delete ${selectedIds.size} event(s)? This cannot be undone.`);
            if (!confirmed) return;

            setIsDeleting(true);
            try {
                const result = await deleteEvents(Array.from(selectedIds));
                if (result?.error) {
                    alert(`Error: ${result.error}`);
                    setIsDeleting(false);
                } else {
                    setSelectedIds(new Set()); // Clear selection
                    // Small delay before reload to ensure state updates
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            } catch (err) {
                console.error(err);
                alert('Failed to delete events. Please try again.');
                setIsDeleting(false);
            }
        }, 0);
    };

    return (
        <div>
            <div className="flex-between mb-2">
                <h1>Your Events</h1>
                <div className="flex" style={{ gap: '1rem' }}>
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleDelete}
                            className="btn"
                            style={{ background: 'red', border: 'none' }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
                        </button>
                    )}
                    <Link href="/admin/events/new" className="btn">
                        + Add New Event
                    </Link>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={events.length > 0 && selectedIds.size === events.length}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Event</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id} style={{ borderTop: '1px solid var(--card-border)', background: selectedIds.has(event.id) ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                                <td style={{ padding: '1rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(event.id)}
                                        onChange={() => toggleEvent(event.id)}
                                    />
                                </td>
                                <td style={{ padding: '1rem' }} suppressHydrationWarning>
                                    {new Date(event.date).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{event.title}</td>
                                <td style={{ padding: '1rem' }}><span className="tag">{event.category}</span></td>
                                <td style={{ padding: '1rem' }}>
                                    <div className="flex">
                                        <Link href={`/admin/events/${event.id}/social`} className="btn btn-sm btn-secondary">
                                            Social
                                        </Link>
                                        <Link href={`/admin/events/${event.id}/edit`} className="btn btn-sm btn-secondary">
                                            Edit
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center" style={{ padding: '2rem', color: '#666' }}>
                                    No events found. Start by adding one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
