'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcrypt'

// Platform admin credentials from environment variables
const PLATFORM_ADMIN = {
    email: process.env.PLATFORM_ADMIN_EMAIL,
    // Hash for password
    passwordHash: process.env.PLATFORM_ADMIN_PASSWORD_HASH
}

export async function platformLogin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Please enter both email and password' }
    }

    if (!PLATFORM_ADMIN.email || !PLATFORM_ADMIN.passwordHash) {
        console.error('Platform admin credentials not configured in environment')
        return { error: 'Server configuration error' }
    }

    // Email check
    if (email !== PLATFORM_ADMIN.email) {
        // Return generic error in production, specific in dev for debugging if needed
        return { error: 'Invalid credentials' }
    }

    // Password check
    const isMatch = await bcrypt.compare(password, PLATFORM_ADMIN.passwordHash);
    if (!isMatch) {
        return { error: 'Invalid credentials' }
    }

    if (email === PLATFORM_ADMIN.email && isMatch) {
        const cookieStore = await cookies()
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

        // Different cookie name for platform admin
        cookieStore.set('platform_admin', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires
        })

        redirect('/platform/dashboard')
    }
}

export async function platformLogout() {
    const cookieStore = await cookies()
    cookieStore.delete('platform_admin')
    redirect('/platform/login')
}
