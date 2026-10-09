import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const API_PREFIX = 'api';
export const DOCS_PATH = `${API_PREFIX}/docs`;

const OPEN_API = new DocumentBuilder().setTitle('Dragons of Mugloar').build();

export const configureApp = (app: INestApplication) => {
  app.setGlobalPrefix(API_PREFIX);

  SwaggerModule.setup(DOCS_PATH, app, () =>
    SwaggerModule.createDocument(app, OPEN_API),
  );

  return app;
};
