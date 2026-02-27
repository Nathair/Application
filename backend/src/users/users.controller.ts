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
        const organized = await this.prisma.event.findMany({
            where: { organizerId: userId },
        });

        const participations = await this.prisma.participant.findMany({
            where: { userId },
            include: { event: true },
        });
        const participated = participations.map(p => p.event);

        const allEventsMap = new Map();
        organized.forEach(e => allEventsMap.set(e.id, e));
        participated.forEach(e => allEventsMap.set(e.id, e));

        return Array.from(allEventsMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
    }
}
