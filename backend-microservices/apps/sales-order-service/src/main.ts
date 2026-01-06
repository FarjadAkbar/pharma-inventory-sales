import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { 
        host: '0.0.0.0',
        port: parseInt(process.env.PORT || '3015'),
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
  console.log('Sales Order Service is listening on port 3015');
}
bootstrap();

