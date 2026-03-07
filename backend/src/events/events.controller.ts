import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, UsePipes, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEventDto, UpdateEventDto, CreateEventSchema, UpdateEventSchema } from './dto/event.dto';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Get()
    @ApiOperation({ summary: 'Fetch public events' })
    async getPublicEvents() {
        return this.eventsService.getPublicEvents();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Fetch single event' })
    async getEventById(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.getEventById(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: 'Create new event' })
    @UsePipes(new YupValidationPipe(CreateEventSchema))
    async createEvent(@Request() req: any, @Body() createEventDto: CreateEventDto) {
        return this.eventsService.createEvent(req.user.id, createEventDto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id')
    @ApiOperation({ summary: 'Edit event' })
    @UsePipes(new YupValidationPipe(UpdateEventSchema))
    async updateEvent(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto) {
        return this.eventsService.updateEvent(req.user.id, id, updateEventDto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete event' })
    async deleteEvent(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.eventsService.deleteEvent(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post(':id/join')
    @ApiOperation({ summary: 'Join event' })
    async joinEvent(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.eventsService.joinEvent(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post(':id/leave')
    @ApiOperation({ summary: 'Leave event' })
    async leaveEvent(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.eventsService.leaveEvent(req.user.id, id);
    }
}
