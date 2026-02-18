import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = (formData.get('type') as string) || 'general';
        const label = (formData.get('label') as string) || null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        // Validate file size (10MB max)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
        }

        // Upload to Vercel Blob
        const blob = await put(`media/${type}/${Date.now()}-${file.name}`, file, {
            access: 'public',
        });

        // Save metadata to database
        const media = await prisma.media.create({
            data: {
                url: blob.url,
                filename: file.name,
                mimeType: file.type,
                size: file.size,
                type,
                label,
            },
        });

        return NextResponse.json({ success: true, media });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
