import { getAllMedia } from '@/app/actions/media';
import MediaLibraryClient from './client';

export default async function MediaLibraryPage() {
    const media = await getAllMedia();
    return <MediaLibraryClient initialMedia={media} />;
}
