import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configureApp, DOCS_PATH } from './app-setup.ts';
import { AppModule } from './app.module.ts';
import { config } from './config.ts';

const app = configureApp(await NestFactory.create(AppModule));

await app.listen(config.port);

Logger.log(
  `http://localhost:${config.port} (API docs at /${DOCS_PATH})`,
  'Bootstrap',
);
