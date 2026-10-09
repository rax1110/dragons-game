import {
  AdIdSchema,
  AdSchema,
  BuyResultSchema,
  GameIdSchema,
  GameStateSchema,
  ItemIdSchema,
  ReputationSchema,
  ShopItemSchema,
  SolveResultSchema,
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
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpstreamClient } from './upstream.client.ts';

const GameIdParam = () => Param('gameId', { schema: GameIdSchema });

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(private readonly upstream: UpstreamClient) {}

  @Post()
  @ApiCreatedResponse({ standardSchema: GameStateSchema })
  createGame() {
    return this.upstream.createGame();
  }

  @Get(':gameId/ads')
  @ApiOkResponse({ standardSchema: AdSchema.array() })
  getAds(@GameIdParam() gameId: GameId) {
    return this.upstream.getAds(gameId);
  }

  @Post(':gameId/ads/:adId/solve')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ standardSchema: SolveResultSchema })
  solveAd(
    @GameIdParam() gameId: GameId,
    @Param('adId', { schema: AdIdSchema }) adId: AdId,
  ) {
    return this.upstream.solveAd(gameId, adId);
  }

  @Get(':gameId/shop')
  @ApiOkResponse({ standardSchema: ShopItemSchema.array() })
  getShop(@GameIdParam() gameId: GameId) {
    return this.upstream.getShop(gameId);
  }

  @Post(':gameId/shop/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ standardSchema: BuyResultSchema })
  buyItem(
    @GameIdParam() gameId: GameId,
    @Param('itemId', { schema: ItemIdSchema }) itemId: ItemId,
  ) {
    return this.upstream.buyItem(gameId, itemId);
  }

  @Post(':gameId/reputation')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ standardSchema: ReputationSchema })
  investigateReputation(@GameIdParam() gameId: GameId) {
    return this.upstream.investigateReputation(gameId);
  }
}
