'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';

interface Props {
    event: {
        id: string;
        title: string;
        description: string;
        date: Date;
        category: string;
        venue: {
            name: string;
            location: string;
        };
    };
}

const BACKGROUNDS = [
    { id: 'neon', name: 'Neon Nightlife', src: '/backgrounds/neon.png' },
    { id: 'pub', name: 'Cozy Pub', src: '/backgrounds/pub.png' },
    { id: 'music', name: 'Live Music', src: '/backgrounds/music.png' },
    { id: 'none', name: 'Solid Color', src: '' }, // Fallback
];

export default function SocialMediaClient({ event }: Props) {
    const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
    const exportRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const dateStr = new Date(event.date).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const timeStr = new Date(event.date).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });

    const twitterText = `Join us at ${event.venue.name} in Romiley for ${event.title}! 🍻\n\n📅 ${dateStr} at ${timeStr}\n📍 ${event.venue.location}\n\n#${event.category.replace(/\s/g, '')} #RomileyEvents`;
    const fbText = `🎉 UPCOMING EVENT IN ROMILEY 🎉\n\nDon't miss ${event.title} at ${event.venue.name}!\n\n${event.description}\n\n📅 When: ${dateStr} @ ${timeStr}\n📍 Where: ${event.venue.location}, Romiley\n\nSee you there! 👋`;

    const handleDownloadImage = async () => {
        if (!exportRef.current) return;
        setIsGenerating(true);
        try {
            const dataUrl = await htmlToImage.toPng(exportRef.current);
            download(dataUrl, `${event.title.replace(/\s/g, '-')}-post.png`);
        } catch (err) {
            console.error(err);
            alert('Failed to generate image');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px' }}>
            <Link href="/admin/dashboard" style={{ color: '#999', marginBottom: '1rem', display: 'inline-block' }}>
                &larr; Back to Dashboard
            </Link>
            <div className="flex-between mb-2">
                <h1>Social Media Generator</h1>
            </div>

            <div className="flex" style={{ gap: '2rem', flexWrap: 'wrap' }}>

                {/* Left Column: Tools */}
                <div style={{ flex: '1 1 400px' }}>
                    {/* Background Selector */}
                    <div className="card mb-2">
                        <h3 className="mb-2">1. Choose Style</h3>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                            {BACKGROUNDS.map(bg => (
                                <div
                                    key={bg.id}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '16/9',
                                        border: selectedBg.id === bg.id ? '2px solid var(--primary)' : '2px solid transparent',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        background: '#333'
                                    }}
                                    onClick={() => setSelectedBg(bg)}
                                >
                                    {bg.src && <img src={bg.src} alt={bg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '0.25rem', fontSize: '0.8rem', textAlign: 'center' }}>
                                        {bg.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Text Copy Tools */}
                    <div className="card">
                        <h3 className="mb-2">2. Copy Caption</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', color: '#999' }}>Twitter / X</label>
                            <textarea readOnly className="input" rows={3} value={twitterText} style={{ width: '100%', fontSize: '0.8rem' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#999' }}>Facebook / Instagram</label>
                            <textarea readOnly className="input" rows={5} value={fbText} style={{ width: '100%', fontSize: '0.8rem' }} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Download */}
                <div style={{ flex: '1 1 400px' }}>
                    <h3 className="mb-2">3. Download Image</h3>

                    <div
                        ref={exportRef}
                        style={{
                            width: '100%',
                            aspectRatio: '1/1',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'white',
                            backgroundColor: selectedBg.id === 'none' ? '#1a1a1a' : 'transparent',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                    >
                        {selectedBg.src && (
                            <img
                                src={selectedBg.src}
                                alt="bg"
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
                            />
                        )}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1 }}></div>

                        <div style={{ position: 'relative', zIndex: 2, border: '4px solid white', padding: '2rem', maxWidth: '90%' }}>
                            <div className="tag" style={{ background: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }}>u/Upcoming Event</div>
                            <h2 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                {event.title}
                            </h2>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#ff006e' }} suppressHydrationWarning>
                                {dateStr}
                            </div>
                            <div style={{ fontSize: '1rem', opacity: 0.9 }} suppressHydrationWarning>
                                @ {timeStr}
                            </div>

                            <div style={{ marginTop: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>
                                📍 {event.venue.name}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleDownloadImage}
                        className="btn mt-2"
                        style={{ width: '100%', fontSize: '1.1rem' }}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Download Image'}
                    </button>
                </div>

            </div>
        </div>
    );
}
