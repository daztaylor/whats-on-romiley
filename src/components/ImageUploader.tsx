'use client';

import { useState, useRef } from 'react';

interface UploadedMedia {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    type: string;
    label: string | null;
    createdAt: Date;
}

interface ImageUploaderProps {
    type: string; // e.g. 'background', 'venue', 'event', 'general'
    label?: string;
    onUploaded?: (media: UploadedMedia) => void;
    accept?: string;
    buttonText?: string;
}

export default function ImageUploader({
    type,
    label,
    onUploaded,
    accept = 'image/*',
    buttonText = '📁 Upload Image',
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setError(null);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            if (label) formData.append('label', label);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            onUploaded?.(data.media);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            setPreview(null);
        } finally {
            setIsUploading(false);
            // Reset input so same file can be re-uploaded if needed
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div>
            <label
                className="btn btn-secondary btn-sm"
                style={{
                    width: '100%',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    display: 'block',
                    textAlign: 'center',
                    opacity: isUploading ? 0.7 : 1,
                }}
            >
                {isUploading ? '⏳ Uploading...' : buttonText}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                />
            </label>
            {error && (
                <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</p>
            )}
        </div>
    );
}
