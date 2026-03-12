import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AssistantModule } from './assistant/assistant.module';

@Module({
    imports: [PrismaModule, AuthModule, UsersModule, EventsModule, AssistantModule],
})
export class AppModule { }