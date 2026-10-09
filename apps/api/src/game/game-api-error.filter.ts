import { GameApiError, GameApiErrorKind } from '@dragons/game-core';
import {
  Catch,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

const STATUS_BY_KIND: Record<GameApiErrorKind, HttpStatus> = {
  [GameApiErrorKind.AdUnavailable]: HttpStatus.CONFLICT,
  [GameApiErrorKind.GameOver]: HttpStatus.GONE,
  [GameApiErrorKind.NotFound]: HttpStatus.NOT_FOUND,
  [GameApiErrorKind.Unavailable]: HttpStatus.BAD_GATEWAY,
};

@Catch(GameApiError)
export class GameApiErrorFilter implements ExceptionFilter<GameApiError> {
  catch(error: GameApiError, host: ArgumentsHost) {
    const statusCode = STATUS_BY_KIND[error.kind];
    const body = { statusCode, kind: error.kind, message: error.message };

    host.switchToHttp().getResponse<Response>().status(statusCode).json(body);
  }
}
