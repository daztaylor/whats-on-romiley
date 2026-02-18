'use server';

import { del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getMediaByType(type: string) {
    return prisma.media.findMany({
        where: { type },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getAllMedia() {
    return prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function deleteMedia(id: string) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new Error('Media not found');

    // Delete from Vercel Blob
    await del(media.url);

    // Delete from database
    await prisma.media.delete({ where: { id } });

    revalidatePath('/platform/dashboard');
    revalidatePath('/platform/media');
}

export async function updateMediaLabel(id: string, label: string) {
    await prisma.media.update({
        where: { id },
        data: { label },
    });
    revalidatePath('/platform/media');
}
