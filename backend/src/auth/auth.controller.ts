import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RegisterSchema, LoginSchema } from './dto/auth.dto';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register user' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @UsePipes(new YupValidationPipe(RegisterSchema))
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 200, description: 'User successfully logged in.' })
    @UsePipes(new YupValidationPipe(LoginSchema))
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
