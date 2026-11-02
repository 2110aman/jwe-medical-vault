import { Module } from '@nestjs/common';
import { ProfileController } from '../controllers/profile.controller';
import { AuthRouteModule } from './auth.module';

@Module({
  imports: [AuthRouteModule],
  controllers: [ProfileController],
})
export class ProfileRouteModule {}

