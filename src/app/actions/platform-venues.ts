'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'

export async function createVenue(prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    const location = formData.get('location') as string
    const type = formData.get('type') as string
    const ownerEmail = formData.get('ownerEmail') as string
    const password = formData.get('password') as string

    if (!name || !ownerEmail || !password) {
        return { error: 'Missing Required Fields' }
    }

    // Check if email already exists
    const existing = await prisma.venue.findUnique({
        where: { ownerEmail }
    })

    if (existing) {
        return { error: 'Email already in use' }
    }

    try {
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.venue.create({
            data: {
                name,
                location,
                type,
                ownerEmail: ownerEmail,
                password: hashedPassword
            }
        })

        revalidatePath('/platform/venues')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Failed to create venue. Email might be in use.' }
    }
}

export async function deleteVenue(id: string) {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('platform_admin')?.value === 'true'

    if (!isAdmin) {
        return { error: 'Unauthorized' }
    }

    try {
        // Delete all venue events first (cascade usually handles this but safety first)
        await prisma.event.deleteMany({ where: { venueId: id } })
        await prisma.venue.delete({ where: { id } })

        revalidatePath('/platform/venues')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Failed to delete venue' }
    }
}

export async function updateVenue(prevState: any, formData: FormData) {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('platform_admin')?.value === 'true'
    if (!isAdmin) return { error: 'Unauthorized' }

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    const type = formData.get('type') as string;
    const ownerEmail = formData.get('ownerEmail') as string;
    const password = formData.get('password') as string;

    try {
        await prisma.venue.update({
            where: { id },
            data: {
                name,
                location,
                type,
                ownerEmail,
                password
            }
        });
        revalidatePath('/platform/venues');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to update venue' };
    }
}

export async function resetVenuePassword(venueId: string, newPassword: string) {
    const cookieStore = await cookies()
    const isPlatformAdmin = cookieStore.get('platform_admin')?.value === 'true'

    if (!isPlatformAdmin) {
        throw new Error('Unauthorized')
    }

    if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.venue.update({
        where: { id: venueId },
        data: { password: hashedPassword }
    })

    revalidatePath('/platform/venues')
    return { success: true }
}
