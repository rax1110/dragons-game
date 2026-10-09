import { Module } from '@nestjs/common';
import { GameSessionStore } from './game-session.store.ts';
import { GameController } from './game.controller.ts';
import { GameService } from './game.service.ts';
import { UpstreamClient } from './upstream.client.ts';

@Module({
  controllers: [GameController],
  providers: [UpstreamClient, GameSessionStore, GameService],
  exports: [UpstreamClient],
})
export class GameModule {}
