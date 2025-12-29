import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.MANUFACTURING_SERVICE_HOST,
      port: parseInt(process.env.MANUFACTURING_SERVICE_PORT || '3013'),
    },
  });

  await app.listen();
  console.log(`Manufacturing Service is listening on port ${process.env.MANUFACTURING_SERVICE_PORT || '3013'}`);
}

bootstrap();

