import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Hash passwords
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Створення користувачів
    const user1 = await prisma.user.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: {
            email: 'alice@example.com',
            name: 'Alice Johnson',
            password: passwordHash,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'bob@example.com' },
        update: {},
        create: {
            email: 'bob@example.com',
            name: 'Bob Smith',
            password: passwordHash,
        },
    });

    console.log('Created users:', { user1: user1.email, user2: user2.email });

    // 2. Створення подій
    const event1 = await prisma.event.create({
        data: {
            title: 'Tech Conference 2026',
            description: 'Annual technology conference covering AI, Web development and more.',
            date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Наступний тиждень
            location: 'Kyiv, Ukraine',
            capacity: 100,
            visibility: 'PUBLIC',
            organizerId: user1.id,
        },
    });

    const event2 = await prisma.event.create({
        data: {
            title: 'Local React Meetup',
            description: 'Discussing the latest features in React 19.',
            date: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // Через два тижні
            location: 'Lviv, Ukraine',
            capacity: 50,
            visibility: 'PUBLIC',
            organizerId: user2.id,
        },
    });

    const event3 = await prisma.event.create({
        data: {
            title: 'Private Team Building',
            description: 'Exclusive event for our core team members.',
            date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // Наступний місяць
            location: 'Carpathian Mountains',
            capacity: 10,
            visibility: 'PRIVATE',
            organizerId: user1.id,
        },
    });

    console.log('Created events:', [event1.title, event2.title, event3.title]);

    // 3. Додавання учасників (Participant)
    await prisma.participant.create({
        data: { userId: user2.id, eventId: event1.id },
    });

    await prisma.participant.create({
        data: { userId: user1.id, eventId: event2.id },
    });

    console.log('Added participants.');
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
