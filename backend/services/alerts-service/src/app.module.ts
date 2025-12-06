import { Module } from '@nestjs/common';

import { InfraModule } from '@/infra/module';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { LibModule } from '@/libs/module';

import { AlertsController } from './alerts.controller';

@Module({
  imports: [InfraModule, LibModule, LoggerModule],
  controllers: [AlertsController],
  providers: []
})
export class AppModule {}
