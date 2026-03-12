import * as yup from 'yup';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const CreateEventSchema = yup.object({
    title: yup.string().required(),
    description: yup.string().optional(),
    date: yup.date()
        .required()
        .test('is-future', 'Event must start at least 15 minutes from now', value => {
            if (!value) return false;
            return value.getTime() >= (new Date().getTime() + 14 * 60 * 1000);
        }),
    endDate: yup.date()
        .nullable()
        .optional()
        .test('is-after-start', 'End date must be at least 15 minutes after start date', function (value) {
            const { date } = this.parent;
            if (!value || !date) return true;
            return value.getTime() >= (new Date(date).getTime() + 15 * 60 * 1000);
        }),
    location: yup.string().required(),
    capacity: yup.number().optional().nullable(),
    visibility: yup.string().oneOf(['PUBLIC', 'PRIVATE']).default('PUBLIC').required(),
    tags: yup.array().of(yup.string().required()).max(5).optional(),
});

export const UpdateEventSchema = yup.object({
    title: yup.string().required(),
    description: yup.string().optional(),
    date: yup.date()
        .optional()
        .test('is-future', 'Event must start at least 15 minutes from now', (value) => {
            if (!value) return true;
            return value.getTime() >= (new Date().getTime() + 14 * 60 * 1000);
        }),
    endDate: yup.date()
        .nullable()
        .optional()
        .test('is-after-start-update', 'End date must be at least 15 minutes after start date', function (value) {
            const { date } = this.parent;
            if (!value || !date) return true;
            return value.getTime() >= (new Date(date).getTime() + 15 * 60 * 1000);
        }),
    location: yup.string().optional(),
    capacity: yup.number().optional().nullable(),
    visibility: yup.string().oneOf(['PUBLIC', 'PRIVATE']).default('PUBLIC').required(),
    tags: yup.array().of(yup.string().required()).max(5).optional(),
});

export class CreateEventDto {
    @ApiProperty() title!: string;
    @ApiPropertyOptional() description?: string;
    @ApiProperty() date!: Date;
    @ApiPropertyOptional() endDate?: Date | null;
    @ApiProperty() location!: string;
    @ApiPropertyOptional() capacity?: number;
    @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' }) visibility?: 'PUBLIC' | 'PRIVATE';
    @ApiPropertyOptional({ type: [String] }) tags?: string[];
}

export class UpdateEventDto {
    @ApiPropertyOptional() title?: string;
    @ApiPropertyOptional() description?: string;
    @ApiPropertyOptional() date?: Date;
    @ApiPropertyOptional() endDate?: Date | null;
    @ApiPropertyOptional() location?: string;
    @ApiPropertyOptional() capacity?: number;
    @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'] }) visibility?: 'PUBLIC' | 'PRIVATE';
    @ApiPropertyOptional({ type: [String] }) tags?: string[];
}
