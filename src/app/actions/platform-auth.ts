'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcrypt'

// Platform admin credentials (in production, store hashed password in env)
const PLATFORM_ADMIN = {
    email: process.env.PLATFORM_ADMIN_EMAIL || 'daz@daztaylor.co.uk',
    passwordHash: process.env.PLATFORM_ADMIN_PASSWORD_HASH || '$2b$10$placeholder' // Will be set in .env
}

export async function platformLogin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Please enter both email and password' }
    }

    // Check if credentials match platform admin
    if (email === PLATFORM_ADMIN.email && await bcrypt.compare(password, PLATFORM_ADMIN.passwordHash)) {
        const cookieStore = await cookies()
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

        // Different cookie name for platform admin
        cookieStore.set('platform_admin', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires
        })

        redirect('/platform/dashboard')
    } else {
        return { error: 'Invalid credentials' }
    }
}

export async function platformLogout() {
    const cookieStore = await cookies()
    cookieStore.delete('platform_admin')
    redirect('/platform/login')
}
