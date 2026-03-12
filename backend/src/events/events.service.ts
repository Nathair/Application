import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { Visibility } from '@prisma/client';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async getPublicEvents(tagList?: string[]) {
        const where: any = { visibility: Visibility.PUBLIC };
        if (tagList && tagList.length > 0) {
            where.tags = {
                some: {
                    name: { in: tagList.map(t => t.toLowerCase()) }
                }
            };
        }

        return this.prisma.event.findMany({
            where,
            include: {
                _count: { select: { participants: true } },
                organizer: { select: { name: true, id: true } },
                tags: true
            },
            orderBy: { date: 'asc' },
        });
    }

    async getEventById(id: number) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                organizer: { select: { id: true, name: true } },
                participants: { include: { user: { select: { id: true, name: true } } } },
                tags: true
            },
        });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }

    async createEvent(userId: number, createEventDto: CreateEventDto) {
        const vis = createEventDto.visibility ? (createEventDto.visibility as Visibility) : Visibility.PUBLIC;
        const normalizedTags = (createEventDto.tags || []).map(t => t.toLowerCase());

        return this.prisma.event.create({
            data: {
                title: createEventDto.title,
                description: createEventDto.description,
                date: createEventDto.date,
                endDate: createEventDto.endDate,
                location: createEventDto.location,
                capacity: createEventDto.capacity,
                visibility: vis,
                organizerId: userId,
                tags: {
                    connectOrCreate: normalizedTags.map(tagName => ({
                        where: { name: tagName },
                        create: { name: tagName }
                    }))
                }
            },
        });
    }

    async updateEvent(userId: number, eventId: number, updateEventDto: UpdateEventDto) {
        const event = await this.getEventById(eventId);
        if (event.organizerId !== userId) throw new ForbiddenException('Only organizer can edit this event');

        const { tags, ...otherData } = updateEventDto;
        const updateData: any = { ...otherData };
        if (updateData.visibility) {
            updateData.visibility = updateData.visibility as Visibility;
        }

        if (updateEventDto.capacity !== undefined && updateEventDto.capacity !== null) {
            const currentObj = await this.prisma.event.findUnique({
                where: { id: eventId },
                include: { _count: { select: { participants: true } } }
            });
            const currentParticipants = currentObj?._count.participants || 0;
            if (updateEventDto.capacity < currentParticipants) {
                throw new BadRequestException(`Capacity cannot be less than current participants (${currentParticipants})`);
            }
        }

        if (tags) {
            const normalizedTags = tags.map(t => t.toLowerCase());
            updateData.tags = {
                set: [], // Disconnect old tags
                connectOrCreate: normalizedTags.map(tagName => ({
                    where: { name: tagName },
                    create: { name: tagName }
                }))
            };
        }

        return this.prisma.event.update({
            where: { id: eventId },
            data: updateData,
            include: { tags: true }
        });
    }

    async getAllTags() {
        return this.prisma.tag.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async deleteEvent(userId: number, eventId: number) {
        const event = await this.getEventById(eventId);
        if (event.organizerId !== userId) throw new ForbiddenException('Only organizer can delete this event');

        await this.prisma.participant.deleteMany({ where: { eventId } });
        await this.prisma.event.delete({ where: { id: eventId } });
        return { success: true };
    }

    async joinEvent(userId: number, eventId: number) {
        const event = await this.getEventById(eventId);

        if (event.capacity) {
            const currentParticipants = await this.prisma.participant.count({ where: { eventId } });
            if (currentParticipants >= event.capacity) throw new BadRequestException('Event is full');
        }

        const existing = await this.prisma.participant.findUnique({
            where: { userId_eventId: { userId, eventId } }
        });

        if (existing) throw new BadRequestException('Already joined');

        return this.prisma.participant.create({
            data: { userId, eventId },
        });
    }

    async leaveEvent(userId: number, eventId: number) {
        const existing = await this.prisma.participant.findUnique({
            where: { userId_eventId: { userId, eventId } }
        });

        if (!existing) throw new BadRequestException('Not a participant');

        await this.prisma.participant.delete({
            where: { userId_eventId: { userId, eventId } }
        });
        return { success: true };
    }
}
