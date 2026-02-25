import { redirect } from 'next/navigation';

export default function PlatformLoginPage() {
    // Auth disabled for local dev - go straight to dashboard
    redirect('/platform/dashboard');
}
