import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JweService } from '../services/jwe.service';
import { UsersService } from '../services/users.service';

@Injectable()
export class JweAuthGuard implements CanActivate {
  private readonly logger = new Logger(JweAuthGuard.name);

  constructor(
    private readonly jweService: JweService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header. JWE Bearer token required.');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization format. Expected: Bearer <jwe_token>');
    }

    try {
      // Decrypt the JWE token using AES-256-GCM
      const payload = await this.jweService.verifyAndDecrypt(token);

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User associated with this JWE token no longer exists.');
      }

      // Attach authenticated safe user and JWE payload to request
      const { passwordHash, ...safeUser } = user;
      request.user = safeUser;
      request.jwePayload = payload;
      request.rawJweToken = token;

      return true;
    } catch (err: any) {
      this.logger.warn(`JWE Authentication failed: ${err.message}`);
      throw new UnauthorizedException(`JWE Authentication failed: ${err.message}`);
    }
  }
}

