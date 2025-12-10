import AdminNav from '@/components/AdminNav';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ paddingLeft: '250px', minHeight: '100vh' }}>
            <AdminNav />
            <div className="admin-container p-2">
                {children}
            </div>
        </div>
    );
}
