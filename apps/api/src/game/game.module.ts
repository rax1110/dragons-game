import { Module } from '@nestjs/common';
import { GameController } from './game.controller.ts';
import { UpstreamClient } from './upstream.client.ts';

@Module({
  controllers: [GameController],
  providers: [UpstreamClient],
  exports: [UpstreamClient],
})
export class GameModule {}
