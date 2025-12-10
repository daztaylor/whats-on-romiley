import { prisma } from '@/lib/prisma';
import SocialMediaClient from './client';

export const dynamic = 'force-dynamic';

export default async function SocialMediaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id },
        include: { venue: true },
    });

    if (!event) return <div>Event not found</div>;

    return <SocialMediaClient event={event} />;
}
