import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = parseInt(process.env.PORT || '3030', 10);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port },
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
  console.log('Quality Service is listening on port', port);
}
bootstrap();
