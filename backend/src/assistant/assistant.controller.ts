import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssistantService } from './assistant.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('assistant')
@Controller('assistant')
export class AssistantController {
    constructor(private readonly assistantService: AssistantService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: 'Ask the AI Assistant a question' })
    async ask(@Request() req: any, @Body('question') question: string) {
        if (!question) {
            return { response: "Please provide a question." };
        }
        const response = await this.assistantService.getAssistantResponse(req.user.id, question);
        return { response };
    }
}
