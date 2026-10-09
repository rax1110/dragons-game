import { join } from 'node:path';
import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { API_PREFIX } from './app-setup.ts';
import { GameApiErrorFilter } from './game/game-api-error.filter.ts';
import { GameModule } from './game/game.module.ts';
import { HealthController } from './health/health.controller.ts';

@Module({
  imports: [
    GameModule,
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'public'),
      exclude: [`/${API_PREFIX}/{*splat}`],
    }),
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_PIPE, useClass: StandardSchemaValidationPipe },
    { provide: APP_FILTER, useClass: GameApiErrorFilter },
  ],
})
export class AppModule {}
