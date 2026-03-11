import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssistantService {
    constructor(private prisma: PrismaService) { }

    async getAssistantResponse(userId: number, question: string) {
        // 1. Fetch data context
        const organized = await this.prisma.event.findMany({
            where: { organizerId: userId },
            include: {
                tags: { select: { name: true } },
                participants: { include: { user: { select: { name: true } } } }
            }
        } as any) as any[];

        const participations = await this.prisma.participant.findMany({
            where: { userId },
            include: {
                event: {
                    include: {
                        tags: { select: { name: true } },
                        participants: { include: { user: { select: { name: true } } } },
                        organizer: { select: { name: true } }
                    }
                }
            }
        } as any) as any[];

        const attending = participations.map(p => p.event);

        // Fetch public events for "this weekend" or tag filtering if not attending
        const publicEvents = await this.prisma.event.findMany({
            where: { visibility: 'PUBLIC' },
            include: {
                tags: { select: { name: true } },
                organizer: { select: { name: true } }
            }
        } as any) as any[];

        // 2. Format Context (Read-only, non-sensitive)
        const context = {
            today: new Date().toISOString(),
            userEvents: {
                organizing: organized.map((e: any) => ({
                    title: e.title,
                    date: e.date,
                    location: e.location,
                    tags: e.tags.map((t: any) => t.name),
                    attendees: e.participants.map((p: any) => p.user.name)
                })),
                attending: attending.map((e: any) => ({
                    title: e?.title,
                    date: e?.date,
                    location: e?.location,
                    tags: e?.tags.map((t: any) => t.name),
                    organizer: e?.organizer?.name,
                    attendees: e?.participants?.map((p: any) => p.user.name) || []
                }))
            },
            discoverableEvents: publicEvents.map((e: any) => ({
                title: e.title,
                date: e.date,
                location: e.location,
                tags: e.tags.map((t: any) => t.name),
                organizer: e.organizer.name
            }))
        };

        const apiKey = process.env.AI_API_KEY;
        const apiUrl = process.env.AI_API_URL;
        const model = process.env.AI_MODEL;

        if (!apiUrl) {
            return "AI Assistant is not configured. Please add AI_API_URL to your .env file.";
        }

        const isLocal = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');

        if (!apiKey && !isLocal) {
            return "AI Assistant is not configured. Please add AI_API_KEY to your .env file.";
        }

        const systemMessage = `You are an AI assistant for an event management application.
You can answer questions about:
- events (organized, attending, or public)
- event dates and times
- tags
- participants/attendees
- event locations

Rules:
- Only use the provided data.
- Do not invent information.
- If the question cannot be answered using the provided data, respond with: "Sorry, I didn’t understand that. Please try rephrasing your question."
- Responses must be concise and helpful.
- Reference the "today" date provided in context for relative time questions (like "this week" or "tomorrow").
- For participants, only list their names.

Current Date: ${context.today}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': apiKey ? `Bearer ${apiKey}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemMessage },
                        { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${question}` }
                    ],
                    temperature: 0.2,
                    max_tokens: 500
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error('AI API Error:', data.error);
                return "Sorry, I'm having trouble connecting to the AI model.";
            }

            // Handle standard OpenAI-compatible response format
            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            }

            return "Sorry, I received an unexpected response format from the AI provider.";
        } catch (error) {
            console.error('Assistant Error:', error);
            return "Sorry, an error occurred while processing your request. Please check your AI model configuration.";
        }
    }
}
