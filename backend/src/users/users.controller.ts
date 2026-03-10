import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private prisma: PrismaService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('me/events')
    @ApiOperation({ summary: 'Fetch user\'s events (calendar)' })
    async getMyEvents(@Request() req: any) {
        const userId = req.user.id;
        const organized: any[] = await this.prisma.event.findMany({
            where: { organizerId: userId },
            include: {
                participants: { include: { user: { select: { id: true, name: true } } } },
                tags: true
            },
        });

        const participations: any[] = await this.prisma.participant.findMany({
            where: { userId },
            include: {
                event: {
                    include: {
                        participants: { include: { user: { select: { id: true, name: true } } } },
                        tags: true
                    }
                }
            },
        });
        const participated = participations.map(p => p.event);

        const allEventsMap = new Map();
        organized.forEach(e => allEventsMap.set(e.id, e));
        participated.forEach(e => {
            if (e) allEventsMap.set(e.id, e);
        });

        return Array.from(allEventsMap.values()).sort((a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }
}
