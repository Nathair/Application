import * as yup from 'yup';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const CreateEventSchema = yup.object({
    title: yup.string().required(),
    description: yup.string().optional(),
    date: yup.date().min(new Date(), 'Cannot create events in the past').required(),
    endDate: yup.date().min(new Date(), 'Cannot create events in the past').nullable().optional(),
    location: yup.string().required(),
    capacity: yup.number().optional().nullable(),
    visibility: yup.string().oneOf(['PUBLIC', 'PRIVATE']).default('PUBLIC').required(),
});

export const UpdateEventSchema = yup.object({
    title: yup.string().required(),
    description: yup.string().optional(),
    date: yup.date().min(new Date(), 'Cannot create events in the past').required(),
    endDate: yup.date().nullable().optional(),
    location: yup.string().required(),
    capacity: yup.number().optional().nullable(),
    visibility: yup.string().oneOf(['PUBLIC', 'PRIVATE']).default('PUBLIC').required(),
});

export class CreateEventDto {
    @ApiProperty() title!: string;
    @ApiPropertyOptional() description?: string;
    @ApiProperty() date!: Date;
    @ApiPropertyOptional() endDate?: Date | null;
    @ApiProperty() location!: string;
    @ApiPropertyOptional() capacity?: number;
    @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' }) visibility?: 'PUBLIC' | 'PRIVATE';
}

export class UpdateEventDto {
    @ApiPropertyOptional() title?: string;
    @ApiPropertyOptional() description?: string;
    @ApiPropertyOptional() date?: Date;
    @ApiPropertyOptional() endDate?: Date | null;
    @ApiPropertyOptional() location?: string;
    @ApiPropertyOptional() capacity?: number;
    @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'] }) visibility?: 'PUBLIC' | 'PRIVATE';
}
