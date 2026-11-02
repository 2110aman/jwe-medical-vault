import { Module } from '@nestjs/common';
import { AuthRouteModule } from './routes/auth.module';
import { ProfileRouteModule } from './routes/profile.module';

@Module({
  imports: [AuthRouteModule, ProfileRouteModule],
})
export class AppModule {}
