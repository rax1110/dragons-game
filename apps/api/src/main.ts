import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { config } from './config.js';

const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api');

const openApi = new DocumentBuilder().setTitle('Dragons of Mugloar').build();
SwaggerModule.setup('api/docs', app, () =>
  SwaggerModule.createDocument(app, openApi),
);

await app.listen(config.port);
Logger.log(
  `http://localhost:${config.port} (API docs at /api/docs)`,
  'Bootstrap',
);
