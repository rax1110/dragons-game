import {
  AdIdSchema,
  GameIdSchema,
  GameSnapshotSchema,
  ItemIdSchema,
  RankedAdSchema,
  ReputationReportSchema,
  TurnEventSchema,
  type AdId,
  type GameId,
  type ItemId,
} from '@dragons/game-core';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { GameService } from './game.service.ts';

const GameIdParam = () => Param('gameId', { schema: GameIdSchema });

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(private readonly games: GameService) {}

  @Post()
  @ApiCreatedResponse({ standardSchema: GameSnapshotSchema })
  createGame() {
    return this.games.createGame();
  }

  @Get(':gameId')
  @ApiOkResponse({ standardSchema: GameSnapshotSchema })
  getGame(@GameIdParam() gameId: GameId) {
    return this.games.getGame(gameId);
  }

  @Get(':gameId/ads')
  @ApiOkResponse({ standardSchema: RankedAdSchema.array() })
  getAds(@GameIdParam() gameId: GameId) {
    return this.games.getAds(gameId);
  }

  @Post(':gameId/ads/:adId/solve')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ standardSchema: TurnEventSchema })
  solveAd(
    @GameIdParam() gameId: GameId,
    @Param('adId', { schema: AdIdSchema }) adId: AdId,
  ) {
    return this.games.solveAd(gameId, adId);
  }

  @Post(':gameId/shop/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ standardSchema: TurnEventSchema })
  buyItem(
    @GameIdParam() gameId: GameId,
    @Param('itemId', { schema: ItemIdSchema }) itemId: ItemId,
  ) {
    return this.games.buyItem(gameId, itemId);
  }

  @Post(':gameId/turns')
  @ApiOkResponse({ standardSchema: TurnEventSchema })
  @ApiNoContentResponse({
    description: 'The game is over or the bot has nothing left to do',
  })
  async playTurn(
    @GameIdParam() gameId: GameId,
    @Res({ passthrough: true }) response: Response,
  ) {
    const event = await this.games.playTurn(gameId);

    response.status(event ? HttpStatus.OK : HttpStatus.NO_CONTENT);

    return event;
  }

  @Post(':gameId/reputation')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ standardSchema: ReputationReportSchema })
  investigateReputation(@GameIdParam() gameId: GameId) {
    return this.games.investigateReputation(gameId);
  }
}
