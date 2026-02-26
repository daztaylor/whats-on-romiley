'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import * as htmlToImage from 'html-to-image';
import Link from 'next/link';
import { platformLogout } from '@/app/actions/platform-auth';
import { importEventsFromCsv } from '@/app/actions/import';
import { deleteEvents } from '@/app/actions/events';
import ImageUploader from '@/components/ImageUploader';

interface EnrichedEvent {
    id: string;
    title: string;
    description: string;
    category: string;
    date: Date;
    venue: {
        name: string;
        location: string;
    };
}

interface SavedMedia {
    id: string;
    url: string;
    filename: string;
    label: string | null;
    type: string;
}

interface PlatformDashboardClientProps {
    events: EnrichedEvent[];
    savedBackgrounds: SavedMedia[];
}

const BACKGROUNDS = [
    { id: 'neon', name: 'Neon Nightlife', src: '/backgrounds/neon.png' },
    { id: 'pub', name: 'Cozy Pub', src: '/backgrounds/pub.png' },
    { id: 'music', name: 'Live Music', src: '/backgrounds/music.png' },
    { id: 'solid', name: 'Solid Color', src: '' },
];

const ASPECT_RATIOS = [
    { id: 'square', name: 'Square (1:1)', ratio: '1/1', width: 1080, height: 1080 },
    { id: 'vertical', name: 'Vertical (4:5)', ratio: '4/5', width: 1080, height: 1350 },
    { id: 'horizontal', name: 'Horizontal (1.91:1)', ratio: '1.91/1', width: 1200, height: 630 },
];

export default function PlatformDashboardClient({ events, savedBackgrounds }: { events: EnrichedEvent[], savedBackgrounds: SavedMedia[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
    const [dbBackgrounds, setDbBackgrounds] = useState<SavedMedia[]>(savedBackgrounds);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState(ASPECT_RATIOS[0]);
    const [titleText, setTitleText] = useState("What's On in Romiley");
    const [bgColor, setBgColor] = useState("#000000"); // Default black
    const [footerText, setFooterText] = useState("DISCOVER MORE ONLINE");
    const exportRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Keep the canvas scaled to fit the preview panel
    useEffect(() => {
        const update = () => {
            if (previewContainerRef.current) {
                setPreviewScale(previewContainerRef.current.offsetWidth / 1080);
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // Filter State
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedVenue, setSelectedVenue] = useState<string>('all');

    // Import State
    // Import State (Manual handling to avoid useActionState/useOptimistic issues)
    const [isImporting, startImportTransition] = useTransition();
    const [importState, setImportState] = useState<any>(null);

    const handleImport = (formData: FormData) => {
        startImportTransition(async () => {
            const result = await importEventsFromCsv(null, formData);
            setImportState(result);
        });
    };

    const handleBgUploaded = (media: { id: string; url: string; filename: string; label: string | null; type: string }) => {
        const newBg: SavedMedia = media;
        setDbBackgrounds(prev => [newBg, ...prev]);
        setSelectedBg({ id: `db-${newBg.id}`, name: newBg.label || newBg.filename, src: newBg.url });
    };

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

    // Filter events
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const eventMonth = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;

        if (selectedMonth !== 'all' && eventMonth !== selectedMonth) return false;
        if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
        if (selectedVenue !== 'all' && event.venue.name !== selectedVenue) return false;

        return true;
    });

    // Get unique values for filters
    const uniqueCategories = Array.from(new Set(events.map(e => e.category))).sort();
    const uniqueVenues = Array.from(new Set(events.map(e => e.venue.name))).sort();

    // Generate month options (current month + next 11 months = 12 total)
    const monthOptions = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthOptions.push({ value, label });
    }

    const clearFilters = () => {
        setSelectedMonth('all');
        setSelectedCategory('all');
        setSelectedVenue('all');
    };

    const handleBulkDelete = () => {
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
                    setSelectedIds(new Set());
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            } catch (e) {
                alert('Failed to delete');
                setIsDeleting(false);
            }
        }, 0);
    };

    const selectedEvents = events.filter(e => selectedIds.has(e.id));

    const handleDownloadImage = async () => {
        if (!exportRef.current) return;
        setIsGenerating(true);
        console.log("Starting image generation...");
        try {
            // Wait a moment for any re-renders
            await new Promise(resolve => setTimeout(resolve, 100));

            // Canvas is a fixed 1080x1350 — capture at 1:1 (pixelRatio:1 = exact 1080x1350 output)
            const dataUrl = await htmlToImage.toPng(exportRef.current, {
                quality: 1.0,
                pixelRatio: 1,
                cacheBust: true,
                backgroundColor: selectedBg.id === 'solid' ? bgColor : '#000000',
                width: 1080,
                height: 1350,
                style: {
                    transform: 'none',       // override the preview scale
                    transformOrigin: 'top left',
                }
            });

            console.log(`Image generated successfully.`);

            const filename = `weekly-whats-on-${new Date().toISOString().split('T')[0]}.png`;

            // POST the base64 image to a server route that responds with
            // Content-Disposition: attachment — the only reliable way to force
            // a file download in Chrome without a direct user gesture on a blob URL
            const response = await fetch('/api/download-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataUrl, filename }),
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

        } catch (err) {
            console.error('Failed to generate image:', err);
            alert('Failed to generate image. Please check the console for error details.');
        } finally {
            setIsGenerating(false);
        }

    };

    const generateSocialText = () => {
        if (selectedEvents.length === 0) return '';
        let text = `🎉 ${titleText} 🎉\n\n`;
        selectedEvents.forEach(e => {
            const day = new Date(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
            text += `🗓 ${day}: ${e.title} @ ${e.venue.name}\n`;
        });
        text += "\n📲 Check the What's On in Romiley app for full details! #Romiley #WhatsOn";
        return text;
    };

    return (
        <div className="admin-container p-2">
            <div className="flex-between mb-2">
                <h1 style={{ color: 'var(--secondary)' }}>Site Command Centre</h1>
                <div className="flex" style={{ gap: '1rem' }}>
                    <Link href="/platform/venues" className="btn btn-secondary">Manage Venues</Link>
                    <Link href="/platform/media" className="btn btn-secondary">🖼 Media Library</Link>
                    <form action={platformLogout}>
                        <button className="btn btn-secondary">Logout</button>
                    </form>
                </div>
            </div>

            <div className="flex" style={{ gap: '1rem', alignItems: 'flex-start' }}>
                {/* Left: Event Selection */}
                <div style={{ flex: 4, minWidth: 0 }}>
                    {/* Master Schedule */}
                    <div className="card">
                        <div className="flex-between mb-2">
                            <h2>Master Schedule</h2>
                            <div className="flex" style={{ gap: '0.5rem' }}>
                                <Link href="/platform/venues" className="btn btn-secondary">
                                    Manage Venues
                                </Link>
                                <form action={platformLogout}>
                                    <button className="btn btn-secondary">Logout</button>
                                </form>
                            </div>
                        </div>

                        {/* Filter Controls */}
                        <div className="flex mb-2" style={{ gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <select
                                className="input"
                                style={{ flex: '1', minWidth: '150px' }}
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="all">All Months</option>
                                {monthOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            <select
                                className="input"
                                style={{ flex: '1', minWidth: '150px' }}
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {uniqueCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                className="input"
                                style={{ flex: '1', minWidth: '150px' }}
                                value={selectedVenue}
                                onChange={(e) => setSelectedVenue(e.target.value)}
                            >
                                <option value="all">All Venues</option>
                                {uniqueVenues.map(venue => (
                                    <option key={venue} value={venue}>{venue}</option>
                                ))}
                            </select>

                            <button
                                onClick={clearFilters}
                                className="btn btn-sm btn-secondary"
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                Clear Filters
                            </button>

                            <span style={{ color: 'var(--muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                {filteredEvents.length} of {events.length} events
                            </span>
                        </div>

                        <div className="flex mb-2" style={{ gap: '0.5rem' }}>
                            <button onClick={toggleAll} className="btn btn-sm btn-secondary">
                                {selectedIds.size === filteredEvents.length ? 'Deselect All' : 'Select All'}
                            </button>
                            {selectedIds.size > 0 && (
                                <button onClick={handleBulkDelete} disabled={isDeleting} className="btn btn-sm btn-danger">
                                    Delete Selected ({selectedIds.size})
                                </button>
                            )}
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '0.5rem', width: '30px' }}></th>
                                    <th style={{ padding: '0.5rem' }}>Event</th>
                                    <th style={{ padding: '0.5rem' }}>Venue</th>
                                    <th style={{ padding: '0.5rem' }}>Date</th>
                                    <th style={{ padding: '0.5rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvents.map(event => (
                                    <tr key={event.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(event.id)}
                                                onChange={() => toggleEvent(event.id)}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{event.title}</td>
                                        <td style={{ padding: '0.5rem' }}>{event.venue.name}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {new Date(event.date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div className="flex" style={{ gap: '0.5rem' }}>
                                                <Link href={`/admin/events/${event.id}/edit`} className="btn btn-sm btn-secondary">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setTimeout(async () => {
                                                            const confirmed = confirm('Delete this event? This cannot be undone.');
                                                            if (confirmed) {
                                                                const result = await deleteEvents([event.id]);
                                                                if (result?.error) {
                                                                    alert(`Error: ${result.error}`);
                                                                } else {
                                                                    window.location.reload();
                                                                }
                                                            }
                                                        }, 0);
                                                    }}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    Del
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Right: Asset Generator Preview */}
                <div style={{ flex: 3, minWidth: 0, position: 'sticky', top: '2rem' }}>
                    <h2 className="mb-2">Asset Generator</h2>

                    {/* Background colour picker — only shown when Solid Color bg is selected */}
                    {selectedBg.id === 'solid' && (
                        <div className="flex mb-2" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem' }}>Background Colour:</label>
                            <input
                                type="color"
                                value={bgColor}
                                onChange={e => {
                                    setBgColor(e.target.value);
                                    setSelectedBg({ id: 'solid', name: 'Solid Color', src: '' });
                                }}
                                style={{ height: '38px', width: '50px', padding: 0, border: 'none', background: 'none' }}
                                title="Choose Background Color"
                            />
                        </div>
                    )}

                    {/* Background Selector */}
                    <div className="grid mb-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                        {/* Built-in backgrounds */}
                        {BACKGROUNDS.map(bg => (
                            <div
                                key={bg.id}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    border: selectedBg.id === bg.id ? '2px solid var(--primary)' : '1px solid transparent',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setSelectedBg(bg)}
                                title={bg.name}
                            >
                                {bg.src ? (
                                    <img src={bg.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#333' }}></div>
                                )}
                            </div>
                        ))}

                        {/* Saved DB backgrounds */}
                        {dbBackgrounds.map(bg => (
                            <div
                                key={bg.id}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    border: selectedBg.id === `db-${bg.id}` ? '2px solid var(--primary)' : '1px solid #555',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onClick={() => setSelectedBg({ id: `db-${bg.id}`, name: bg.label || bg.filename, src: bg.url })}
                                title={bg.label || bg.filename}
                            >
                                <img src={bg.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    background: 'rgba(0,0,0,0.7)', padding: '2px',
                                    fontSize: '0.6rem', textAlign: 'center',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>{bg.label || bg.filename}</div>
                            </div>
                        ))}
                    </div>

                    {/* Upload new background */}
                    <div className="mb-2">
                        <ImageUploader
                            type="background"
                            buttonText="📁 Upload & Save Background"
                            onUploaded={handleBgUploaded}
                        />
                    </div>

                    {/* Preview wrapper — scales true 1080px canvas to fit the panel */}
                    <div
                        ref={previewContainerRef}
                        style={{
                            width: '100%',
                            height: `${Math.round(1350 * previewScale)}px`,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* The Image Canvas — true 1080×1350px, scaled visually for preview */}
                        <div
                            ref={exportRef}
                            style={{
                                width: '1080px',
                                height: '1350px',
                                transformOrigin: 'top left',
                                transform: `scale(${previewScale})`,
                                background: selectedBg.id === 'solid' ? bgColor : 'black',
                                paddingTop: '306px',
                                paddingBottom: '128px',
                                paddingLeft: '12px',
                                paddingRight: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                color: 'white',
                                fontFamily: 'sans-serif',
                                position: 'relative',
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                            }}
                        >
                            {selectedBg.src && (
                                <img
                                    src={selectedBg.src}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}

                            <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* 2-column grid — max 8 cards */}
                                <div style={{
                                    flex: 1,
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gridAutoRows: '1fr',
                                    gap: '0.5rem',
                                    overflow: 'hidden',
                                    width: '100%',
                                }}>
                                    {selectedEvents.slice(0, 8).map((e, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(30, 30, 30, 0.9)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            padding: '0.6rem 0.75rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.15rem',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
                                            minHeight: 0,
                                        }}>
                                            {/* Col A (Date) + Col C (Start Time) */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'baseline',
                                                borderBottom: '1px solid rgba(255,255,255,0.2)',
                                                paddingBottom: '0.2rem',
                                                marginBottom: '0.15rem',
                                            }}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    color: '#C1FF72',
                                                    fontSize: '24px',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    {new Date(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </div>
                                                <div style={{
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                    color: '#C1FF72',
                                                }}>
                                                    {new Date(e.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </div>
                                            </div>

                                            {/* Col B — Venue */}
                                            <div style={{
                                                fontSize: '24px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                opacity: 0.75,
                                            }}>
                                                {e.venue.name}
                                            </div>

                                            {/* Col E — Event Name */}
                                            <div style={{
                                                fontWeight: '800',
                                                fontSize: '32px',
                                                lineHeight: 1.15,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {e.title}
                                            </div>

                                            {/* Col F — Detail */}
                                            <div style={{
                                                fontSize: '24px',
                                                opacity: 0.85,
                                                marginTop: '0.1rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: 1.35,
                                            }}>
                                                {e.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col mt-2" style={{ gap: '1rem' }}>
                        <button
                            onClick={handleDownloadImage}
                            disabled={isGenerating}
                            className="btn mt-2"
                            style={{ width: '100%' }}
                        >
                            {isGenerating ? 'Generating...' : 'Download Image'}
                        </button>

                        <textarea
                            readOnly
                            className="input mt-2"
                            style={{ width: '100%', height: '150px' }}
                            value={generateSocialText()}
                        />

                        {/* CSV Import */}
                        <div className="card mt-2">
                            <h3>Import Events (CSV)</h3>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>
                                Format: Date, Venue, Time, Category, Title, Description, BookingURL
                                <br />Example: 24/01/2026, The Venue, 19:30, Live Music, Event Name, Details, https://tickets.com
                            </p>
                            <form action={handleImport}>
                                <input type="file" name="file" accept=".csv" className="input mb-2" style={{ width: '100%' }} required />
                                <button className="btn btn-secondary" style={{ width: '100%' }} disabled={isImporting}>
                                    {isImporting ? 'Importing...' : 'Upload CSV'}
                                </button>
                                {importState?.message && (
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: importState.success ? 'green' : 'red' }}>
                                        {importState.message}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
