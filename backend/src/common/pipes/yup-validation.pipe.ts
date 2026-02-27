import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Schema } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
    constructor(private schema: Schema<any>) { }

    async transform(value: any, metadata: ArgumentMetadata) {
        try {
            await this.schema.validate(value, { abortEarly: false, stripUnknown: true });
            return value;
        } catch (err: any) {
            throw new BadRequestException({ message: 'Validation failed', errors: err.errors });
        }
    }
}
