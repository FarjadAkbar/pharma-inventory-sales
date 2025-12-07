import '@pharma/utils/tracing';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ILoggerAdapter } from '@pharma/infra/logger/adapter';
import { SERVICE_PORTS } from '@pharma/utils/constants';

import { name } from '../../../package.json';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.SITES_SERVICE_HOST || '0.0.0.0',
      port: SERVICE_PORTS.SITES_SERVICE
    }
  });

  const loggerService = app.get(ILoggerAdapter);
  loggerService.setApplication(name);
  app.useLogger(loggerService);

  await app.listen();
  loggerService.log(`🟢 ${name} Sites Service listening on TCP port ${SERVICE_PORTS.SITES_SERVICE} 🟢`);
}
bootstrap();
