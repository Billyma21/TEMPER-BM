/**
 * TEMPER API
 * MAAYOUD
 */
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { env } from './config/env.js';

async function bootstrap() {
  const cfg = env();
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: cfg.WEB_PUBLIC_URL, credentials: true });
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.enableShutdownHooks();

  if (cfg.NODE_ENV !== 'production') {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('TEMPER API')
        .setDescription('API de la chocolaterie. Les ressources métier passent par le gabarit CRUD filtré par les droits.')
        .setVersion('0.2.0')
        .addCookieAuth(cfg.SESSION_COOKIE, { type: 'apiKey', in: 'cookie' }, 'temper_session')
        .build(),
    );
    SwaggerModule.setup('api/docs', app, doc);
  }

  await app.listen(cfg.API_PORT);
  new Logger('TEMPER').log(`API prête sur le port ${cfg.API_PORT}`);
}

void bootstrap();
