import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { HealthController } from './health.controller.js';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'public'),
      exclude: ['/api/{*splat}'],
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
