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
        port: parseInt(process.env.PORT || '3016'),
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
  console.log('Shipment Service is listening on port 3016');
}
bootstrap();

