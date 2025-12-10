'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function parseStrictDate(dateStr: string, timeStr: string) {
    // Strict format: DD/MM/YYYY and HH:MM
    try {
        const [day, month, year] = dateStr.trim().split('/').map(Number);
        const [hours, minutes] = timeStr.trim().split(':').map(Number);

        if (!day || !month || !year || hours === undefined || minutes === undefined) {
            return null;
        }

        const date = new Date(year, month - 1, day, hours, minutes);
        if (isNaN(date.getTime())) return null;

        return date;
    } catch (e) {
        return null;
    }
}

// Helper to split CSV line respecting quotes
function parseCsvLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, '')); // Remove surrounding quotes
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
}

export async function importEventsFromCsv(prevState: any, formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { error: 'No file uploaded' };
    }

    const text = await file.text();
    const lines = text.split('\n');

    let createdVenues = 0;
    let createdEvents = 0;
    let errors = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Skip header
        if (line.toLowerCase().startsWith('date,venue')) continue;

        // Parse Line
        const cols = parseCsvLine(line);
        // Expected: Date, Venue, Time, Category, Title, Detail
        if (cols.length < 5) {
            console.warn(`Skipping invalid line ${i + 1}: ${line}`);
            errors++;
            continue;
        }

        // Map columns
        const dateStr = cols[0];
        const venueName = cols[1];
        const timeStr = cols[2];
        const category = cols[3];
        const title = cols[4];
        const detail = cols[5] || '';
        const bookingUrl = cols[6] || null;

        if (!dateStr || !venueName || !timeStr || !category || !title) {
            console.warn(`Skipping incomplete line ${i + 1}`);
            errors++;
            continue;
        }

        try {
            // 1. Find or Create Venue
            let venue = await prisma.venue.findFirst({
                where: { name: venueName.trim() }
            });

            if (!venue) {
                const slug = generateSlug(venueName.trim());
                venue = await prisma.venue.create({
                    data: {
                        name: venueName.trim(),
                        location: 'Romiley',
                        type: 'Other',
                        ownerEmail: `${slug}@placeholder.com`,
                        password: 'temp123'
                    }
                });
                createdVenues++;
            }

            // 2. Parse Date
            const eventDate = parseStrictDate(dateStr, timeStr);
            if (!eventDate) {
                console.warn(`Invalid date/time on line ${i + 1}: ${dateStr} ${timeStr}`);
                errors++;
                continue;
            }

            // 3. Upsert Event (update if exists, create if new)
            // Use venue + title + date (same day) as unique identifier
            const dayStart = new Date(eventDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(eventDate);
            dayEnd.setHours(23, 59, 59, 999);

            const existingEvent = await prisma.event.findFirst({
                where: {
                    venueId: venue.id,
                    title: title,
                    date: {
                        gte: dayStart,
                        lte: dayEnd
                    }
                }
            });

            if (existingEvent) {
                // Update existing event
                await prisma.event.update({
                    where: { id: existingEvent.id },
                    data: {
                        description: detail,
                        category: category,
                        bookingUrl: bookingUrl,
                        date: eventDate // Update time if changed
                    }
                });
            } else {
                // Create new event
                await prisma.event.create({
                    data: {
                        title: title,
                        description: detail,
                        date: eventDate,
                        category: category,
                        venueId: venue.id,
                        bookingUrl: bookingUrl
                    }
                });
            }
            createdEvents++;

        } catch (e) {
            console.error(`Error processing line ${i + 1}:`, e);
            errors++;
        }
    }

    revalidatePath('/platform/dashboard');
    revalidatePath('/events');

    return {
        success: true,
        message: `Import complete. Processed ${createdEvents} events and created ${createdVenues} new venues. (${errors} skipped)`
    };
}
