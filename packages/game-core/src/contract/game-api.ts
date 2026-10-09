import { z } from 'zod';

const identifier = z.string().regex(/^[\w-]{1,64}$/);

export const GameIdSchema = identifier.brand<'GameId'>();
export const AdIdSchema = identifier.brand<'AdId'>();
export const ItemIdSchema = identifier.brand<'ItemId'>();
export type GameId = z.infer<typeof GameIdSchema>;
export type AdId = z.infer<typeof AdIdSchema>;
export type ItemId = z.infer<typeof ItemIdSchema>;

export const GameStateSchema = z.object({
  gameId: GameIdSchema,
  lives: z.number().int(),
  gold: z.number(),
  level: z.number().int(),
  score: z.number(),
  turn: z.number().int(),
});
export type GameState = z.infer<typeof GameStateSchema>;

export const RawAdSchema = z.object({
  adId: z.string().min(1),
  message: z.string(),
  reward: z.coerce.number(),
  expiresIn: z.coerce.number().int(),
  encrypted: z.number().int().nullish(),
  probability: z.string(),
});
export type RawAd = z.infer<typeof RawAdSchema>;

export const Encoding = {
  Plain: 'plain',
  Base64: 'base64',
  Rot13: 'rot13',
} as const;
export type Encoding = (typeof Encoding)[keyof typeof Encoding];

export const AdSchema = z.object({
  adId: AdIdSchema,
  message: z.string(),
  reward: z.number(),
  expiresIn: z.number().int(),
  probability: z.string(),
  encoding: z.enum(Encoding),
});
export type Ad = z.infer<typeof AdSchema>;

export const RankedAdSchema = AdSchema.extend({
  successRate: z.number(),
  expectedValue: z.number(),
  harmful: z.boolean(),
  viable: z.boolean(),
  recommended: z.boolean(),
});
export type RankedAd = z.infer<typeof RankedAdSchema>;

export const SolveResultSchema = z.object({
  success: z.boolean(),
  lives: z.number().int(),
  gold: z.number(),
  score: z.number(),
  turn: z.number().int(),
  message: z.string(),
});
export type SolveResult = z.infer<typeof SolveResultSchema>;

export const ShopItemSchema = z.object({
  id: ItemIdSchema,
  name: z.string(),
  cost: z.coerce.number(),
});
export type ShopItem = z.infer<typeof ShopItemSchema>;

export const ShopSchema = z.union([
  z.array(ShopItemSchema),
  z.object({ items: z.array(ShopItemSchema) }).transform((shop) => shop.items),
]);

export const BuyResultSchema = z.object({
  shoppingSuccess: z.union([z.boolean(), z.stringbool()]),
  gold: z.number(),
  lives: z.number().int(),
  level: z.number().int(),
  turn: z.number().int(),
});
export type BuyResult = z.infer<typeof BuyResultSchema>;

export const ReputationSchema = z.object({
  people: z.number(),
  state: z.number(),
  underworld: z.number(),
});
export type Reputation = z.infer<typeof ReputationSchema>;

export const ReputationReportSchema = z.object({
  reputation: ReputationSchema,
  state: GameStateSchema,
});
export type ReputationReport = z.infer<typeof ReputationReportSchema>;

export const GameSnapshotSchema = z.object({
  state: GameStateSchema,
  shop: z.array(ShopItemSchema),
});
export type GameSnapshot = z.infer<typeof GameSnapshotSchema>;

export const ActionType = {
  Solve: 'solve',
  Buy: 'buy',
  Stop: 'stop',
} as const;

export const MoveSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal(ActionType.Solve), ad: RankedAdSchema }),
  z.object({ type: z.literal(ActionType.Buy), item: ShopItemSchema }),
]);
export type Move = z.infer<typeof MoveSchema>;
export type Action = Move | { type: typeof ActionType.Stop };

export const TurnEventSchema = z.object({
  move: MoveSchema,
  state: GameStateSchema,
  message: z.string(),
  succeeded: z.boolean(),
});
export type TurnEvent = z.infer<typeof TurnEventSchema>;

export interface GameApi {
  createGame(): Promise<GameState>;
  getAds(gameId: GameId): Promise<Ad[]>;
  solveAd(gameId: GameId, adId: AdId): Promise<SolveResult>;
  getShop(gameId: GameId): Promise<ShopItem[]>;
  buyItem(gameId: GameId, itemId: ItemId): Promise<BuyResult>;
  investigateReputation(gameId: GameId): Promise<Reputation>;
}

export const GameApiErrorKind = {
  AdUnavailable: 'ad-unavailable',
  GameOver: 'game-over',
  NotFound: 'not-found',
  Unavailable: 'unavailable',
} as const;
export type GameApiErrorKind =
  (typeof GameApiErrorKind)[keyof typeof GameApiErrorKind];

export class GameApiError extends Error {
  readonly kind: GameApiErrorKind;

  constructor(
    kind: GameApiErrorKind,
    message: string = kind,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'GameApiError';
    this.kind = kind;
  }
}

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  kind: z.enum(GameApiErrorKind),
  message: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
