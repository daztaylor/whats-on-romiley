'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { addWeeks, addMonths } from 'date-fns'

export async function createEvent(prevState: any, formData: FormData) {
    const cookieStore = await cookies()
    const venueId = cookieStore.get('venue_id')?.value

    if (!venueId) {
        return { error: 'Unauthorized' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const dateStr = formData.get('date') as string
    const category = formData.get('category') as string
    const recurrence = formData.get('recurrence') as string
    const bookingUrl = formData.get('bookingUrl') as string

    if (!title || !dateStr) {
        return { error: 'Missing Required Fields' }
    }

    const startDate = new Date(dateStr)
    const groupId = crypto.randomUUID()

    // Base event data
    const eventData = {
        title,
        description: description || '',
        category: category || 'General',
        venueId,
        groupId: recurrence !== 'none' ? groupId : null,
        recurrence: recurrence !== 'none' ? recurrence : null,
        bookingUrl: bookingUrl || null
    }

    // Create first instance
    try {
        console.log('Creating base event with:', JSON.stringify(eventData, null, 2));
        await prisma.event.create({
            data: {
                ...eventData,
                date: startDate
            }
        })

        // Handle Recurrence (Generate next 12 instances)
        if (recurrence === 'weekly') {
            console.log('Generating weekly events...');
            for (let i = 1; i <= 12; i++) {
                await prisma.event.create({
                    data: {
                        ...eventData,
                        date: addWeeks(startDate, i)
                    }
                })
            }
        } else if (recurrence === 'monthly') {
            console.log('Generating monthly events...');
            for (let i = 1; i <= 6; i++) {
                await prisma.event.create({
                    data: {
                        ...eventData,
                        date: addMonths(startDate, i)
                    }
                })
            }
        }
    } catch (error) {
        console.error('Error creating event:', error);
        return { error: `Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }

    revalidatePath('/')
    revalidatePath('/events')
    revalidatePath('/admin/dashboard')

    redirect('/admin/dashboard')
}

export async function updateEvent(id: string, prevState: any, formData: FormData) {
    const cookieStore = await cookies()
    const venueId = cookieStore.get('venue_id')?.value
    const isPlatformAdmin = cookieStore.get('platform_admin')?.value === 'true' || process.env.NODE_ENV === 'development'

    if (!venueId && !isPlatformAdmin) {
        return { error: 'Unauthorized' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const dateStr = formData.get('date') as string
    const category = formData.get('category') as string
    const bookingUrl = formData.get('bookingUrl') as string

    if (!title || !dateStr) {
        return { error: 'Missing Required Fields' }
    }

    // Safety: If regular BO, ensure they own the event
    if (!isPlatformAdmin && venueId) {
        const event = await prisma.event.findUnique({ where: { id } })
        if (!event || event.venueId !== venueId) {
            return { error: 'Unauthorized' }
        }
    }

    await prisma.event.update({
        where: { id },
        data: {
            title,
            description,
            category,
            date: new Date(dateStr),
            bookingUrl: bookingUrl || null
        }
    })

    revalidatePath('/')
    revalidatePath('/events')

    if (isPlatformAdmin) {
        revalidatePath('/platform/dashboard')
        redirect('/platform/dashboard')
    } else {
        revalidatePath('/admin/dashboard')
        redirect('/admin/dashboard')
    }
}

export async function deleteEvents(ids: string[]) {
    const cookieStore = await cookies()
    const venueId = cookieStore.get('venue_id')?.value
    const isPlatformAdmin = cookieStore.get('platform_admin')?.value === 'true' || process.env.NODE_ENV === 'development'

    if (!venueId && !isPlatformAdmin) {
        return { error: 'Unauthorized' }
    }

    try {
        const where: any = { id: { in: ids } }
        if (!isPlatformAdmin) {
            where.venueId = venueId // Ensure ownership for regular BO
        }

        await prisma.event.deleteMany({
            where
        })
        revalidatePath('/admin/dashboard')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Failed to delete events' }
    }
}
