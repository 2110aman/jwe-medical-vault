import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { JweService } from '../services/jwe.service';
import { DbService } from '../services/db.service';
import { JweAuthGuard } from '../guards/jwe-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, JweService, DbService, JweAuthGuard],
  exports: [AuthService, UsersService, JweService, DbService, JweAuthGuard],
})
export class AuthRouteModule {}

