import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { API_PREFIX } from './app-setup.ts';
import { HealthController } from './health.controller.ts';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'public'),
      exclude: [`/${API_PREFIX}/{*splat}`],
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
