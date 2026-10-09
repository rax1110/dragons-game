import {
  canContinue,
  GameApiError,
  GameApiErrorKind,
  sleep,
  type AdId,
  type GameId,
  type GameState,
  type ItemId,
  type RankedAd,
  type Reputation,
  type ShopItem,
  type TurnEvent,
} from '@dragons/game-core';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { gameApi } from './game-api.ts';

export const Phase = {
  Idle: 'idle',
  Busy: 'busy',
  Autoplay: 'autoplay',
} as const;
export type Phase = (typeof Phase)[keyof typeof Phase];

const AUTOPLAY_PAUSE_MS = 400;

const UNEXPECTED_ERROR = 'Something went wrong. Please try again.';

const MESSAGE_BY_KIND: Record<GameApiErrorKind, string | null> = {
  [GameApiErrorKind.AdUnavailable]:
    'That ad is no longer on offer. Pick another one.',
  [GameApiErrorKind.GameOver]: null,
  [GameApiErrorKind.NotFound]: 'That game is gone. Start a new one.',
  [GameApiErrorKind.Unavailable]:
    'The game server is not answering. Try again in a moment.',
};

type GameData = {
  gameId: GameId | null;
  state: GameState | null;
  shop: ShopItem[];
  ads: RankedAd[];
  reputation: Reputation | null;
  events: TurnEvent[];
  phase: Phase;
  error: string | null;
};

type GameActions = {
  createGame: () => Promise<void>;
  resumeGame: () => Promise<void>;
  solveAd: (adId: AdId) => Promise<void>;
  buyItem: (itemId: ItemId) => Promise<void>;
  investigateReputation: () => Promise<void>;
  startAutoplay: () => Promise<void>;
  stopAutoplay: () => void;
  leaveGame: () => void;
};

export type GameStore = GameData & GameActions;

const initialData: GameData = {
  gameId: null,
  state: null,
  shop: [],
  ads: [],
  reputation: null,
  events: [],
  phase: Phase.Idle,
  error: null,
};

export const selectBusy = (store: GameStore) => store.phase !== Phase.Idle;

export const selectRecommendedAd = (store: GameStore) =>
  store.ads.find((ad) => ad.recommended) ?? null;

export const selectLastEvent = (store: GameStore) =>
  store.events.at(-1) ?? null;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      const requireGameId = () => {
        const { gameId } = get();

        if (!gameId)
          throw new GameApiError(
            GameApiErrorKind.NotFound,
            'No game in progress',
          );

        return gameId;
      };

      const loadAds = async (gameId: GameId) =>
        set({ ads: await gameApi.getAds(gameId) });

      const refreshAdsQuietly = (gameId: GameId) =>
        loadAds(gameId).catch(() => null);

      const applyEvent = async (gameId: GameId, event: TurnEvent) => {
        set(({ events }) => ({
          state: event.state,
          events: [...events, event],
        }));

        if (canContinue(event.state)) await loadAds(gameId);
      };

      const fail = async (error: unknown) => {
        const kind = error instanceof GameApiError ? error.kind : null;
        const { state, gameId } = get();

        set({ error: kind ? MESSAGE_BY_KIND[kind] : UNEXPECTED_ERROR });

        if (kind === GameApiErrorKind.GameOver && state)
          set({ state: { ...state, lives: 0 } });
        if (kind === GameApiErrorKind.NotFound)
          set({ gameId: null, state: null });
        if (kind === GameApiErrorKind.AdUnavailable && gameId)
          await refreshAdsQuietly(gameId);
      };

      const perform = async (task: () => Promise<void>) => {
        set({ phase: Phase.Busy, error: null });

        try {
          await task();
        } catch (error) {
          await fail(error);
        } finally {
          set({ phase: Phase.Idle });
        }
      };

      return {
        ...initialData,

        createGame: () =>
          perform(async () => {
            const { state, shop } = await gameApi.createGame();

            set({ ...initialData, gameId: state.gameId, state, shop });
            await loadAds(state.gameId);
          }),

        resumeGame: () =>
          perform(async () => {
            const gameId = requireGameId();
            const { state, shop } = await gameApi.getGame(gameId);

            set({ state, shop });

            if (canContinue(state)) await loadAds(gameId);
          }),

        solveAd: (adId) =>
          perform(async () => {
            const gameId = requireGameId();

            await applyEvent(gameId, await gameApi.solveAd(gameId, adId));
          }),

        buyItem: (itemId) =>
          perform(async () => {
            const gameId = requireGameId();

            await applyEvent(gameId, await gameApi.buyItem(gameId, itemId));
          }),

        investigateReputation: () =>
          perform(async () => {
            const { reputation, state } =
              await gameApi.investigateReputation(requireGameId());

            set({ reputation, state });
          }),

        startAutoplay: async () => {
          set({ phase: Phase.Autoplay, error: null });

          try {
            const gameId = requireGameId();
            let event = await gameApi.playTurn(gameId);

            while (event) {
              await applyEvent(gameId, event);

              if (get().phase !== Phase.Autoplay) break;

              await sleep(AUTOPLAY_PAUSE_MS);

              event = await gameApi.playTurn(gameId);
            }
          } catch (error) {
            await fail(error);
          } finally {
            set({ phase: Phase.Idle });
          }
        },

        stopAutoplay: () => set({ phase: Phase.Idle }),

        leaveGame: () => set(initialData),
      };
    },
    {
      name: 'dragons-game',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ gameId }) => ({ gameId }),
    },
  ),
);
