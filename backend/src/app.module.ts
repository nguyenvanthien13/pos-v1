import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { OrderEmailController } from './order-email.controller';
import { SyncController } from './sync.controller';
@Module({controllers:[HealthController,OrderEmailController,SyncController]})
export class AppModule {}
