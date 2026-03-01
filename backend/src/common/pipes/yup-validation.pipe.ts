import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Schema } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
    constructor(private schema: Schema<any>) { }

    async transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type !== 'body') {
            return value;
        }

        try {
            // Return the cast/coerced value from Yup, not the raw original.
            // This ensures string→Date, string→number etc. are converted correctly.
            const validated = await this.schema.validate(value, { abortEarly: false, stripUnknown: true });
            return validated;
        } catch (err: any) {
            throw new BadRequestException({ message: 'Validation failed', errors: err.errors });
        }
    }
}
