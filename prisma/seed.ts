import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Hash passwords for security
  const hashedPassword1 = await bcrypt.hash('password123', 10)
  const hashedPassword2 = await bcrypt.hash('securepass', 10)
  const hashedPassword3 = await bcrypt.hash('testtest', 10)

  // Create Venues with hashed passwords
  const venue1 = await prisma.venue.upsert({
    where: { ownerEmail: 'owner@pub.com' },
    update: {},
    create: {
      name: 'The Red Lion',
      location: 'Romiley',
      type: 'Pub',
      ownerEmail: 'owner@pub.com',
      password: hashedPassword1
    }
  })

  const venue2 = await prisma.venue.upsert({
    where: { ownerEmail: 'chef@bistro.com' },
    update: {},
    create: {
      name: 'Le Bistro',
      location: 'Romiley',
      type: 'Restaurant',
      ownerEmail: 'chef@bistro.com',
      password: hashedPassword2
    }
  })

  const venue3 = await prisma.venue.upsert({
    where: { ownerEmail: 'test@test.com' },
    update: {},
    create: {
      name: 'The Piggy',
      location: 'Romiley',
      type: 'Pub',
      ownerEmail: 'test@test.com',
      password: hashedPassword3
    }
  })

  console.log('Venues created:', { venue1, venue2, venue3 })

  // Create sample events
  const events = [
    {
      title: 'Live Music Night',
      description: 'Local bands performing live',
      date: new Date('2025-12-11T20:00:00'),
      category: 'Music',
      venueId: venue1.id
    },
    {
      title: 'Pub Quiz',
      description: 'Weekly trivia night with prizes',
      date: new Date('2025-12-12T21:00:00'),
      category: 'Quiz',
      venueId: venue1.id
    },
    {
      title: 'Karaoke Night',
      description: 'Sing your heart out!',
      date: new Date('2025-12-13T20:30:00'),
      category: 'Music',
      venueId: venue1.id
    }
  ]

  for (const event of events) {
    await prisma.event.create({ data: event })
  }

  console.log('Sample events created')
  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
