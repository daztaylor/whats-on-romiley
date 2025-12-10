'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcrypt'

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Please enter both email and password' }
    }

    const venue = await prisma.venue.findUnique({
        where: { ownerEmail: email }
    })

    // Use bcrypt to compare passwords securely
    if (venue && await bcrypt.compare(password, venue.password)) {
        const cookieStore = await cookies()
        // 1 day expiration
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        cookieStore.set('venue_id', venue.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires
        })
        redirect('/admin/dashboard')
    } else {
        return { error: 'Invalid credentials' }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('venue_id')
    redirect('/')
}
