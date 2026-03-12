import { PrismaClient, Visibility } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Hash passwords
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Створення користувачів
    const user1 = await prisma.user.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: { email: 'alice@example.com', name: 'Alice Johnson', password: passwordHash },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'bob@example.com' },
        update: {},
        create: { email: 'bob@example.com', name: 'Bob Smith', password: passwordHash },
    });

    const user3 = await prisma.user.upsert({
        where: { email: 'charlie@example.com' },
        update: {},
        create: { email: 'charlie@example.com', name: 'Charlie Brown', password: passwordHash },
    });

    console.log('Created 3 users');

    const now = new Date();

    // 2. Створення різнопланових подій
    const eventsData = [
        {
            title: 'Tech Conference 2026 (Future, Limited)',
            description: 'Annual technology conference covering AI and Web development.',
            date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            location: 'Kyiv, Ukraine',
            capacity: 100,
            visibility: Visibility.PUBLIC,
            organizerId: user1.id,
            tags: {
                connectOrCreate: [
                    { where: { name: 'tech' }, create: { name: 'tech' } },
                    { where: { name: 'conference' }, create: { name: 'conference' } },
                    { where: { name: 'ai' }, create: { name: 'ai' } }
                ]
            }
        },
        {
            title: 'Last Night Party (Past Event)',
            description: 'This event has already finished.',
            date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            endDate: new Date(now.getTime() - 20 * 60 * 60 * 1000),
            location: 'Kyiv, Rooftop',
            capacity: 200,
            visibility: Visibility.PUBLIC,
            organizerId: user2.id,
            tags: {
                connectOrCreate: [
                    { where: { name: 'party' }, create: { name: 'party' } },
                    { where: { name: 'music' }, create: { name: 'music' } }
                ]
            }
        },
        {
            title: 'Long Workshop (3 Days)',
            description: 'Intensive React & NestJS workshop.',
            date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
            endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
            location: 'Remote, Zoom',
            capacity: null as number | null,
            visibility: Visibility.PUBLIC,
            organizerId: user3.id,
            tags: {
                connectOrCreate: [
                    { where: { name: 'workshop' }, create: { name: 'workshop' } },
                    { where: { name: 'education' }, create: { name: 'education' } }
                ]
            }
        },
        {
            title: 'Full House Meetup',
            description: 'This event will be full immediately after seeding.',
            date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            location: 'Lviv, Office Center',
            capacity: 2,
            visibility: Visibility.PUBLIC,
            organizerId: user1.id,
            tags: {
                connectOrCreate: [
                    { where: { name: 'meetup' }, create: { name: 'meetup' } },
                    { where: { name: 'tech' }, create: { name: 'tech' } }
                ]
            }
        },
        {
            title: 'Private Founder Dinner',
            description: 'Only for invited stakeholders.',
            date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
            location: 'Secret Location',
            capacity: 10,
            visibility: Visibility.PRIVATE,
            organizerId: user2.id,
            tags: {
                connectOrCreate: [
                    { where: { name: 'business' }, create: { name: 'business' } },
                    { where: { name: 'networking' }, create: { name: 'networking' } }
                ]
            }
        },
        {
            title: 'Morning Yoga (Daily)',
            description: 'Quick morning yoga session.',
            date: new Date(now.getTime() + 1 * 60 * 60 * 1000),
            location: 'Park',
            capacity: 15,
            visibility: Visibility.PUBLIC,
            organizerId: user3.id,
            tags: {
                connectOrCreate: [
                    { where: { name: 'yoga' }, create: { name: 'yoga' } },
                    { where: { name: 'health' }, create: { name: 'health' } }
                ]
            }
        }
    ];

    const createdEvents = [];
    for (const e of eventsData) {
        const ev = await prisma.event.create({ data: e });
        createdEvents.push(ev);
    }

    console.log(`Created ${createdEvents.length} distinct events`);

    // 3. Додавання учасників
    // Fill the 'Full House Meetup' (event index 3)
    const fullEvent = createdEvents[3];
    await prisma.participant.createMany({
        data: [
            { userId: user2.id, eventId: fullEvent.id },
            { userId: user3.id, eventId: fullEvent.id },
        ]
    });

    // Add some random participation
    await prisma.participant.create({ data: { userId: user1.id, eventId: createdEvents[2].id } });
    await prisma.participant.create({ data: { userId: user3.id, eventId: createdEvents[0].id } });

    console.log('Seeding process completed successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log('Seeding finished.');
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
