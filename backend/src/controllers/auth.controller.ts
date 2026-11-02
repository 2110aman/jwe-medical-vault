import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JweAuthGuard } from '../guards/jwe-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('inspect')
  inspectToken(@Query('token') token: string) {
    if (!token) {
      return { error: 'Please provide ?token= query parameter' };
    }
    return this.authService.inspectToken(token);
  }

  @Get('me')
  @UseGuards(JweAuthGuard)
  getMe(@CurrentUser() user: any) {
    return {
      authenticated: true,
      user,
    };
  }

  @Get('demo-users')
  getDemoUsers() {
    return [
      {
        email: 'alex.rivera@medivault.io',
        password: 'password123',
        name: 'Alex Rivera, M.Sc.',
        role: 'Patient / Research Scientist',
        badge: 'Universal Donor O-',
        note: 'Has chronic asthma record & penicillin allergy',
      },
      {
        email: 'sarah.jenkins@healthgrid.org',
        password: 'password123',
        name: 'Dr. Sarah Jenkins',
        role: 'Chief of Medicine',
        badge: 'Blood Type A+',
        note: 'Has migraine records & sulfa allergy',
      },
    ];
  }
}

