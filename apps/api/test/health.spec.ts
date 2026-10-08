import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { configureApp } from '../src/app-setup.ts';
import { AppModule } from '../src/app.module.ts';

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = configureApp(moduleRef.createNestApplication());

  await app.init();
});

afterAll(() => app.close());

it('reports health', async () => {
  const response = await request(app.getHttpServer()).get('/api/health');

  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: 'ok' });
});
