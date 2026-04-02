import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './infra/app.module';
import { HttpExceptionFilter } from './infra/http/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Configuração CORS para permitir requisições do frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // URL do frontend Next.js
    credentials: true, // Permite envio de cookies/credenciais
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('ReservaEstudio API')
    .setDescription('API para gerenciamento de gigs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
