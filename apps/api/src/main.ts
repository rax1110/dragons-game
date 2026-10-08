import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_PREFIX, configureApp } from './app-setup.ts';
import { AppModule } from './app.module.ts';
import { config } from './config.ts';

const DOCS_PATH = `${API_PREFIX}/docs`;

const app = configureApp(await NestFactory.create(AppModule));
const openApi = new DocumentBuilder().setTitle('Dragons of Mugloar').build();

SwaggerModule.setup(DOCS_PATH, app, () =>
  SwaggerModule.createDocument(app, openApi),
);

await app.listen(config.port);

Logger.log(
  `http://localhost:${config.port} (API docs at /${DOCS_PATH})`,
  'Bootstrap',
);
