import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { JweService } from './jwe.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jweService: JweService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for ${loginDto.email}`);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Issue 5-part JWE Encrypted Token
    const token = await this.jweService.createToken({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: 'PATIENT',
    });

    // Return only the auth token (minimal confidential payload)
    return {
      accessToken: token,
      tokenType: 'Bearer',
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('A user with this email address already exists.');
    }

    const newUser = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      fullName: registerDto.fullName,
      phone: registerDto.phone,
      avatarUrl: registerDto.avatarUrl,
      address: registerDto.address as any,
    });

    const token = await this.jweService.createToken({
      sub: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: 'PATIENT',
    });

    // Return only the auth token
    return {
      accessToken: token,
      tokenType: 'Bearer',
    };
  }

  inspectToken(token: string) {
    return this.jweService.inspectToken(token);
  }
}

