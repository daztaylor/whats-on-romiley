'use client';

import { useState, useRef, useTransition } from 'react';
import * as htmlToImage from 'html-to-image';
import Link from 'next/link';
import { platformLogout } from '@/app/actions/platform-auth';
import { importEventsFromCsv } from '@/app/actions/import';
import { deleteEvents } from '@/app/actions/events'; // Changed import

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

interface PlatformDashboardClientProps {
    initialEvents: EnrichedEvent[]; // Changed prop name and type
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

export default function PlatformDashboardClient({ events }: { events: EnrichedEvent[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
    const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState(ASPECT_RATIOS[0]);
    const [titleText, setTitleText] = useState("What's On in Romiley");
    const [bgColor, setBgColor] = useState("#000000"); // Default black
    const [footerText, setFooterText] = useState("DISCOVER MORE ONLINE");
    const exportRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setCustomBgUrl(dataUrl);
                setSelectedBg({ id: 'custom', name: 'Custom Upload', src: dataUrl });
            };
            reader.readAsDataURL(file);
        }
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
                await deleteEvents(Array.from(selectedIds));
                setSelectedIds(new Set());
                setTimeout(() => {
                    window.location.reload();
                }, 100);
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

            // Calculate precise pixel ratio to match target width
            const currentWidth = exportRef.current.offsetWidth;
            const targetWidth = selectedAspectRatio.width;
            const targetHeight = selectedAspectRatio.height;
            const scale = targetWidth / currentWidth;

            console.log(`Generating image. Current width: ${currentWidth}, Target: ${targetWidth}, Scale: ${scale}`);

            // Use toBlob instead of toPng for better handling of large image data
            const blob = await htmlToImage.toBlob(exportRef.current, {
                quality: 1.0,
                pixelRatio: Math.max(scale, 2),
                cacheBust: true,
                backgroundColor: selectedBg.id === 'solid' ? bgColor : '#000000',
                width: currentWidth,
                height: currentWidth / (selectedAspectRatio.width / selectedAspectRatio.height),
                style: {
                    transform: 'none'
                }
            });

            if (!blob) {
                throw new Error("Failed to generate image blob");
            }

            console.log(`Image generated successfully. Size: ${blob.size} bytes`);

            // Create object URL for the blob
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const filename = `weekly-whats-on-${new Date().toISOString().split('T')[0]}.png`;
            link.download = filename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);

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
                    <Link href="/platform/venues" className="btn btn-secondary">
                        Manage Venues
                    </Link>
                    <form action={platformLogout}>
                        <button className="btn btn-secondary">Logout</button>
                    </form>
                </div>
            </div>

            <div className="flex" style={{ gap: '2rem', alignItems: 'flex-start' }}>
                {/* Left: Event Selection */}
                <div style={{ flex: 1 }}>
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
                                                                await deleteEvents([event.id]);
                                                                window.location.reload();
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
                <div style={{ flex: 1, position: 'sticky', top: '2rem' }}>
                    <h2 className="mb-2">Asset Generator</h2>

                    {/* Aspect Ratio Selector */}
                    <div className="mb-2">
                        <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Format</label>
                        <select
                            className="input w-full"
                            value={selectedAspectRatio.id}
                            onChange={(e) => {
                                const ratio = ASPECT_RATIOS.find(r => r.id === e.target.value);
                                if (ratio) setSelectedAspectRatio(ratio);
                            }}
                        >
                            {ASPECT_RATIOS.map(ratio => (
                                <option key={ratio.id} value={ratio.id}>
                                    {ratio.name} - {ratio.width}x{ratio.height}px
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Text Inputs */}
                    <div className="flex flex-col mb-2" style={{ gap: '0.5rem' }}>
                        <div className="flex" style={{ gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="input"
                                value={titleText}
                                onChange={e => setTitleText(e.target.value)}
                                placeholder="Main Title"
                                style={{ flex: 1 }}
                            />
                            {selectedBg.id === 'solid' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                        </div>
                        <input
                            type="text"
                            className="input"
                            value={footerText}
                            onChange={e => setFooterText(e.target.value)}
                            placeholder="Footer Text"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Background Selector */}
                    <div className="grid mb-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
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

                        {/* Custom Upload Preview */}
                        {customBgUrl && (
                            <div
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    border: selectedBg.id === 'custom' ? '2px solid var(--primary)' : '1px solid #666',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onClick={() => setSelectedBg({ id: 'custom', name: 'Custom Upload', src: customBgUrl })}
                                title="Custom Upload"
                            >
                                <img src={customBgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'rgba(0,0,0,0.7)',
                                    padding: '2px',
                                    fontSize: '0.7rem',
                                    textAlign: 'center'
                                }}>Custom</div>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <div className="mb-2">
                        <label className="btn btn-secondary btn-sm" style={{ width: '100%', cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                            📁 Upload Custom Background
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCustomImageUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    {/* The Image Canvas */}
                    <div
                        ref={exportRef}
                        style={{
                            width: '100%',
                            aspectRatio: selectedAspectRatio.ratio,
                            background: selectedBg.id === 'none' ? 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' : (selectedBg.id === 'solid' ? bgColor : 'black'),
                            padding: selectedAspectRatio.id === 'horizontal' ? '1rem' : '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            fontFamily: 'sans-serif',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {selectedBg.src && (
                            <img
                                src={selectedBg.src}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                            />
                        )}

                        <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                marginBottom: '0.5rem',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                lineHeight: 1.1,
                                flexShrink: 0
                            }}>
                                {titleText}
                            </h2>

                            <div style={{
                                flex: 1,
                                display: 'grid',
                                gridTemplateColumns: selectedEvents.length === 1 ? '1fr' : '1fr 1fr',
                                gridAutoRows: '1fr', // Force equal height rows
                                alignContent: 'center',
                                gap: selectedEvents.length > 6 ? '0.4rem' : '0.75rem',
                                overflow: 'hidden',
                                width: '100%'
                            }}>
                                {selectedEvents.map((e, i) => {
                                    // Dynamic font sizing based on count
                                    const isCompact = selectedEvents.length > 6;
                                    const isSingle = selectedEvents.length === 1;

                                    return (
                                        <div key={i} style={{
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: '8px',
                                            padding: isCompact ? '0.4rem' : '0.75rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.1rem',
                                            backdropFilter: 'blur(4px)',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                            minHeight: 0, // Allow shrinking
                                            justifyContent: 'center'
                                        }}>
                                            {/* Date & Time Row */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'baseline',
                                                borderBottom: '1px solid rgba(255,255,255,0.2)',
                                                paddingBottom: '0.2rem',
                                                marginBottom: '0.2rem'
                                            }}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    color: '#ff006e',
                                                    fontSize: isSingle ? '1.2rem' : (isCompact ? '0.75rem' : '0.9rem'),
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {new Date(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </div>
                                                <div style={{
                                                    fontSize: isSingle ? '1.1rem' : (isCompact ? '0.7rem' : '0.85rem'),
                                                    fontWeight: 'bold',
                                                    opacity: 0.9
                                                }}>
                                                    {new Date(e.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </div>
                                            </div>

                                            {/* Venue */}
                                            <div style={{
                                                fontSize: isSingle ? '1rem' : (isCompact ? '0.6rem' : '0.7rem'),
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                opacity: 0.8,
                                                marginBottom: '0.1rem'
                                            }}>
                                                @{e.venue.name}
                                            </div>

                                            {/* Title */}
                                            <div style={{
                                                fontWeight: '800',
                                                fontSize: isSingle ? '1.8rem' : (isCompact ? '0.9rem' : '1.1rem'),
                                                lineHeight: 1.1,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginBottom: 'auto' // Push description down
                                            }}>
                                                {e.title}
                                            </div>

                                            {/* Description (Truncated) */}
                                            <div style={{
                                                fontSize: isSingle ? '1.1rem' : (isCompact ? '0.65rem' : '0.8rem'),
                                                opacity: 0.9,
                                                marginTop: '0.2rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: isSingle ? 4 : (isCompact ? 2 : 3),
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: 1.3
                                            }}>
                                                {e.description}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{
                                marginTop: '0.5rem',
                                fontSize: '0.7rem',
                                opacity: 0.8,
                                letterSpacing: '2px',
                                textAlign: 'center',
                                textShadow: '0 1px 2px black',
                                flexShrink: 0
                            }}>
                                {footerText}
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
