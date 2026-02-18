import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { dataUrl, filename } = await request.json();

        if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
            return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
        }

        // Strip the data URL prefix and decode to binary
        const base64 = dataUrl.replace('data:image/png;base64,', '');
        const buffer = Buffer.from(base64, 'base64');

        // Respond with the image as a file download
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="${filename || 'whats-on.png'}"`,
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }
}
