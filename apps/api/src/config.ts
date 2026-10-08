import { GAME_API_BASE_URL } from '@dragons/game-core';
import { z } from 'zod';

const ConfigSchema = z.object({
  port: z.coerce.number().int().positive().default(3000),
  gameApiBaseUrl: z.url().default(GAME_API_BASE_URL),
});

export const config = ConfigSchema.parse({
  port: process.env.PORT,
  gameApiBaseUrl: process.env.GAME_API_BASE_URL,
});
