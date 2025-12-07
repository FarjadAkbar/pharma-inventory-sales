import '../../../src/utils/tracing';

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
      host: process.env.QA_RELEASES_SERVICE_HOST || '0.0.0.0',
      port: SERVICE_PORTS.QA_RELEASES_SERVICE
    }
  });

  const loggerService = app.get(ILoggerAdapter);
  loggerService.setApplication(name);
  app.useLogger(loggerService);

  await app.listen();
  loggerService.log(`🟢 ${name} QA Releases Service listening on TCP port ${SERVICE_PORTS.QA_RELEASES_SERVICE} 🟢`);
}
bootstrap();
