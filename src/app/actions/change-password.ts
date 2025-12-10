'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcrypt'

export async function changePassword(prevState: any, formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: 'All fields are required' }
    }

    if (newPassword !== confirmPassword) {
        return { error: 'New passwords do not match' }
    }

    if (newPassword.length < 8) {
        return { error: 'Password must be at least 8 characters' }
    }

    // Get current venue from session
    const cookieStore = await cookies()
    const venueId = cookieStore.get('venue_id')?.value

    if (!venueId) {
        return { error: 'Not authenticated' }
    }

    const venue = await prisma.venue.findUnique({
        where: { id: venueId }
    })

    if (!venue) {
        return { error: 'Venue not found' }
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, venue.password)
    if (!isValid) {
        return { error: 'Current password is incorrect' }
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.venue.update({
        where: { id: venueId },
        data: { password: hashedPassword }
    })

    return { success: true, message: 'Password changed successfully' }
}
