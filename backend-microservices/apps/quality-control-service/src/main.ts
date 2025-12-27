import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    {
      transport: Transport.TCP,
      options: { 
        host: process.env.QUALITY_CONTROL_SERVICE_HOST || '0.0.0.0',
        port: parseInt(process.env.QUALITY_CONTROL_SERVICE_PORT || '3010'),
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
  console.log(`Quality Control Service is listening on port ${process.env.QUALITY_CONTROL_SERVICE_PORT || '3010'}`);
}
bootstrap();

