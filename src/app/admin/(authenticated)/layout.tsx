import AdminNav from '@/components/AdminNav';
import { auth } from '@/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const user = session?.user;

    return (
        <div style={{ paddingLeft: '250px', minHeight: '100vh' }}>
            <AdminNav user={user} />
            <div className="admin-container p-2">
                {children}
            </div>
        </div>
    );
}
