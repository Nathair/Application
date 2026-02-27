import * as yup from 'yup';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const CreateEventSchema = yup.object({
    title: yup.string().required(),
    description: yup.string().optional(),
    date: yup.date().min(new Date(), 'Cannot create events in the past').required(),
    location: yup.string().required(),
    capacity: yup.number().optional().nullable(),
    visibility: yup.string().oneOf(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});

export const UpdateEventSchema = yup.object({
    title: yup.string().optional(),
    description: yup.string().optional(),
    date: yup.date().min(new Date(), 'Cannot create events in the past').optional(),
    location: yup.string().optional(),
    capacity: yup.number().optional().nullable(),
    visibility: yup.string().oneOf(['PUBLIC', 'PRIVATE']).optional(),
});

export class CreateEventDto {
    @ApiProperty() title!: string;
    @ApiPropertyOptional() description?: string;
    @ApiProperty() date!: Date;
    @ApiProperty() location!: string;
    @ApiPropertyOptional() capacity?: number;
    @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' }) visibility?: 'PUBLIC' | 'PRIVATE';
}

export class UpdateEventDto {
    @ApiPropertyOptional() title?: string;
    @ApiPropertyOptional() description?: string;
    @ApiPropertyOptional() date?: Date;
    @ApiPropertyOptional() location?: string;
    @ApiPropertyOptional() capacity?: number;
    @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'] }) visibility?: 'PUBLIC' | 'PRIVATE';
}
