'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function deleteEventAsAdmin(id: string) {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('platform_admin')?.value === 'true'

    if (!isAdmin) {
        return { error: 'Unauthorized' }
    }

    try {
        await prisma.event.delete({ where: { id } })
        revalidatePath('/platform/dashboard')
        return { success: true }
    } catch (e) {
        return { error: 'Failed' }
    }
}

export async function deleteEventsAsAdmin(ids: string[]) {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('platform_admin')?.value === 'true'

    if (!isAdmin) {
        return { error: 'Unauthorized' }
    }

    try {
        await prisma.event.deleteMany({
            where: {
                id: { in: ids }
            }
        })
        revalidatePath('/platform/dashboard')
        return { success: true }
    } catch (e) {
        return { error: 'Failed' }
    }
}

// We could add updateEventAsAdmin here too, but honestly editing from the dashboard 
// might be best served by just redirecting to the BO "Edit" page but with bypassed auth?
// Or we just replicate the update logic. For now, let's implement delete first as requested.
