'use client';

import { useState, useTransition } from 'react';
import { deleteMedia } from '@/app/actions/media';
import ImageUploader from '@/components/ImageUploader';
import Link from 'next/link';
import { platformLogout } from '@/app/actions/platform-auth';

interface Media {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    type: string;
    label: string | null;
    createdAt: Date;
}

const TYPE_LABELS: Record<string, string> = {
    background: '🖼 Background',
    venue: '🏠 Venue',
    event: '🎉 Event',
    general: '📁 General',
};

const ALL_TYPES = ['all', 'background', 'venue', 'event', 'general'];

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryClient({ initialMedia }: { initialMedia: Media[] }) {
    const [media, setMedia] = useState<Media[]>(initialMedia);
    const [filterType, setFilterType] = useState('all');
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const filtered = filterType === 'all' ? media : media.filter(m => m.type === filterType);

    const handleUploaded = (newMedia: Media) => {
        setMedia(prev => [newMedia, ...prev]);
    };

    const handleDelete = (id: string) => {
        setTimeout(async () => {
            if (!confirm('Delete this image? This cannot be undone.')) return;
            setDeletingId(id);
            startTransition(async () => {
                try {
                    await deleteMedia(id);
                    setMedia(prev => prev.filter(m => m.id !== id));
                } catch (e) {
                    alert('Failed to delete image.');
                } finally {
                    setDeletingId(null);
                }
            });
        }, 0);
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="admin-container p-2">
            {/* Header */}
            <div className="flex-between mb-2">
                <h1 style={{ color: 'var(--secondary)' }}>Media Library</h1>
                <div className="flex" style={{ gap: '1rem' }}>
                    <Link href="/platform/dashboard" className="btn btn-secondary">← Dashboard</Link>
                    <form action={platformLogout}>
                        <button className="btn btn-secondary">Logout</button>
                    </form>
                </div>
            </div>

            <div className="flex" style={{ gap: '2rem', alignItems: 'flex-start' }}>
                {/* Sidebar: Upload + Filters */}
                <div style={{ width: '220px', flexShrink: 0 }}>
                    <div className="card mb-2">
                        <h3 className="mb-2">Upload Image</h3>
                        <div className="flex flex-col" style={{ gap: '0.5rem' }}>
                            {['background', 'venue', 'event', 'general'].map(t => (
                                <ImageUploader
                                    key={t}
                                    type={t}
                                    buttonText={`${TYPE_LABELS[t]}`}
                                    onUploaded={handleUploaded}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="mb-2">Filter</h3>
                        <div className="flex flex-col" style={{ gap: '0.4rem' }}>
                            {ALL_TYPES.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ textAlign: 'left' }}
                                >
                                    {t === 'all' ? '📂 All' : TYPE_LABELS[t]} ({t === 'all' ? media.length : media.filter(m => m.type === t).length})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main: Image Grid */}
                <div style={{ flex: 1 }}>
                    {filtered.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                            <p>No images yet. Upload one using the panel on the left.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '1rem'
                        }}>
                            {filtered.map(m => (
                                <div
                                    key={m.id}
                                    className="card"
                                    style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{
                                        aspectRatio: '1',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        background: '#111'
                                    }}>
                                        <img
                                            src={m.url}
                                            alt={m.label || m.filename}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>

                                    {/* Meta */}
                                    <div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }} title={m.filename}>
                                            {m.label || m.filename}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                            {TYPE_LABELS[m.type] || m.type} · {formatBytes(m.size)}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>
                                            {new Date(m.createdAt).toLocaleDateString('en-GB')}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex" style={{ gap: '0.4rem' }}>
                                        <button
                                            onClick={() => handleCopyUrl(m.url)}
                                            className="btn btn-sm btn-secondary"
                                            style={{ flex: 1, fontSize: '0.7rem' }}
                                        >
                                            {copied === m.url ? '✓ Copied!' : '🔗 Copy URL'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(m.id)}
                                            disabled={deletingId === m.id}
                                            className="btn btn-sm btn-danger"
                                            style={{ fontSize: '0.7rem' }}
                                        >
                                            {deletingId === m.id ? '...' : '🗑'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
