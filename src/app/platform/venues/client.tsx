'use client'

import { useActionState, useState, useEffect } from 'react'
import { createVenue, deleteVenue, updateVenue } from '@/app/actions/platform-venues'

interface Venue {
    id: string
    name: string
    type: string
    location: string
    ownerEmail: string
}

export default function VenueManagementClient({ venues }: { venues: any[] }) {
    const [createState, createAction, isCreating] = useActionState(createVenue, null)
    const [editingVenue, setEditingVenue] = useState<any | null>(null);
    const [updateState, updateAction, isUpdating] = useActionState(updateVenue, null);

    // Reset form after successful create/update
    useEffect(() => {
        if (createState?.success) {
            // In a real app we'd reset the form ref or use a key to force re-render
        }
        if (updateState?.success) {
            setEditingVenue(null);
        }
    }, [createState, updateState])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the venue and ALL its events.')) return;
        await deleteVenue(id);
    }

    return (
        <div className="flex gap-2" style={{ alignItems: 'flex-start' }}>
            {/* List */}
            <div className="card" style={{ flex: 1, padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Location</th>
                            <th style={{ padding: '1rem' }}>Events</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venues.map(v => (
                            <tr key={v.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{v.name}</td>
                                <td style={{ padding: '1rem' }}>{v.type}</td>
                                <td style={{ padding: '1rem' }}>{v.location}</td>
                                <td style={{ padding: '1rem' }}>{v._count?.events || 0}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div className="flex" style={{ gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => setEditingVenue(v)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(v.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {venues.length === 0 && (
                            <tr><td colSpan={5} className="p-2 text-center">No venues yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Form */}
            <div className="card" style={{ width: '300px', position: 'sticky', top: '1rem' }}>
                <h3>{editingVenue ? 'Edit Venue' : 'Add New Venue'}</h3>
                {editingVenue && (
                    <button onClick={() => setEditingVenue(null)} className="btn btn-sm btn-secondary mb-2" style={{ width: '100%' }}>
                        Cancel Edit
                    </button>
                )}

                <form action={editingVenue ? updateAction : createAction} className="flex flex-col gap-1">
                    {editingVenue && <input type="hidden" name="id" value={editingVenue.id} />}

                    <div>
                        <label className="text-sm">Venue Name</label>
                        <input name="name" className="input w-full" defaultValue={editingVenue?.name} required placeholder="e.g. The Red Lion" />
                    </div>
                    <div>
                        <label className="text-sm">Type</label>
                        <select name="type" className="input w-full" defaultValue={editingVenue?.type || "Pub"}>
                            <option value="Pub">Pub</option>
                            <option value="Club">Club</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Theatre">Theatre</option>
                            <option value="Community">Community</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm">Location</label>
                        <input name="location" className="input w-full" defaultValue={editingVenue?.location || "Romiley"} required />
                    </div>
                    <hr style={{ borderColor: '#444' }} />
                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Owner Login Credentials</p>
                    <div>
                        <label className="text-sm">Email</label>
                        <input name="ownerEmail" type="email" className="input w-full" defaultValue={editingVenue?.ownerEmail} required placeholder="owner@venue.com" />
                    </div>
                    <div>
                        <label className="text-sm">Password</label>
                        <input name="password" className="input w-full" defaultValue={editingVenue?.password} required placeholder="SecretPassword" />
                    </div>

                    <button className="btn w-full mt-2" disabled={isCreating || isUpdating}>
                        {editingVenue ? (isUpdating ? 'Updating...' : 'Save Changes') : (isCreating ? 'Creating...' : 'Create Valid Venue')}
                    </button>

                    {(createState?.error || updateState?.error) && (
                        <p style={{ color: 'red', fontSize: '0.8rem' }}>
                            {createState?.error || updateState?.error}
                        </p>
                    )}
                    {(createState?.success || updateState?.success) && (
                        <p style={{ color: 'green', fontSize: '0.8rem' }}>
                            Success!
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
