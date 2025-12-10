import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    // Find venues with NO future events
    const venues = await prisma.venue.findMany({
        include: {
            events: {
                where: {
                    date: { gte: new Date() }
                }
            }
        }
    });

    const staleVenues = venues.filter(v => v.events.length === 0);
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
}
