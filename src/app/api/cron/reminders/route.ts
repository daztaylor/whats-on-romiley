import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // Find venues with NO future events directly in the database
        const staleVenues = await prisma.venue.findMany({
            where: {
                events: {
                    none: {
                        date: { gte: new Date() }
                    }
                }
            }
        });

        const sentEmails = [];

        for (const venue of staleVenues) {
            // Simulate sending email
            console.log(`[EMAIL SENT] To: ${venue.ownerEmail}, Subject: Update your listings!, Body: Hey ${venue.name}, you have no upcoming events. Add some now to get customers!`);
            sentEmails.push(venue.ownerEmail);
        }

        return NextResponse.json({
            message: 'Reminders processed',
            staleCount: staleVenues.length,
            sentTo: sentEmails
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
