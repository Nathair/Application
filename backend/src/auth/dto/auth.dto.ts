import * as yup from 'yup';
import { ApiProperty } from '@nestjs/swagger';

export const RegisterSchema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
    name: yup.string().required(),
});

export const LoginSchema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
});

export class RegisterDto {
    @ApiProperty() email!: string;
    @ApiProperty() password!: string;
    @ApiProperty() name!: string;
}

export class LoginDto {
    @ApiProperty() email!: string;
    @ApiProperty() password!: string;
}
