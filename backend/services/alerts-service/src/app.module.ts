import { Module } from '@nestjs/common';

import { InfraModule } from '@pharma/infra/module';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { LibModule } from '@pharma/libs/module';

import { AlertsController } from './alerts.controller';

@Module({
  imports: [InfraModule, LibModule, LoggerModule],
  controllers: [AlertsController],
  providers: []
})
export class AppModule {}
