import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable API versioning with /v1 prefix
  app.setGlobalPrefix('v1');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  
  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`API Gateway running on http://localhost:${port}`);
}
bootstrap();
