import { prisma } from '@/lib/prisma';
import EditEventForm from './form';

export default async function EditEventPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id },
    });

    if (!event) return <div>Event not found</div>;

    return (
        <div style={{ maxWidth: '600px' }}>
            <h1 className="mb-2">Edit Event</h1>
            <EditEventForm event={event} />
        </div>
    );
}
