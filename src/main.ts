import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚀 Ativa a validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // lança erro se o body tiver campos extras
      transform: true, // transforma payloads para instâncias das classes DTO
    }),
  );

  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}
bootstrap();
