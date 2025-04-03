import { type UTCTimestamp } from "lightweight-charts";
import { create } from "zustand";

export enum LastChangeType {
  Up = "Up",
  Down = "Down",
  Default = "Default",
}

interface StoredValuePair {
  value: number;
  lastChangeType: LastChangeType;
}

export interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface WebSocketStoreState {
  prices: Record<string, StoredValuePair>;
  volumes: Record<string, StoredValuePair>;
  lastCandle: Record<string, Candle>;
  updatePrice: (symbol: string, price: number) => void;
  updateVolume: (symbol: string, volume: number) => void;
  setLastCandle: (symbol: string, candle: Candle) => void;
}

export const useWebSocketStore = create<WebSocketStoreState>((set) => ({
  prices: {},
  volumes: {},
  lastCandle: {},

  updatePrice: (symbol, price) =>
    set((state) => {
      const formattedNewPrice = Number(price.toFixed(2));
      const prevPrice = state.prices[symbol]?.value ?? formattedNewPrice;
      const lastChangeType =
        formattedNewPrice > prevPrice
          ? LastChangeType.Up
          : formattedNewPrice < prevPrice
          ? LastChangeType.Down
          : LastChangeType.Default;

      const updatedPrices = {
        prices: {
          ...state.prices,
          [symbol]: { value: formattedNewPrice, lastChangeType },
        },
      };

      setTimeout(() => {
        set((state) => ({
          prices: {
            ...state.prices,
            [symbol]: {
              ...state.prices[symbol]!,
              lastChangeType: LastChangeType.Default,
            },
          },
        }));
      }, 500);

      return updatedPrices;
    }),

  updateVolume: (symbol, volume) =>
    set((state) => {
      const formattedNewVolume = Number(volume.toFixed(0));
      const prevVolume = state.volumes[symbol]?.value ?? formattedNewVolume;
      const lastChangeType =
        formattedNewVolume > prevVolume
          ? LastChangeType.Up
          : formattedNewVolume < prevVolume
          ? LastChangeType.Down
          : LastChangeType.Default;

      const updatedVolumes = {
        volumes: {
          ...state.volumes,
          [symbol]: { value: formattedNewVolume, lastChangeType },
        },
      };

      setTimeout(() => {
        set((state) => ({
          volumes: {
            ...state.volumes,
            [symbol]: {
              ...state.volumes[symbol]!,
              lastChangeType: LastChangeType.Default,
            },
          },
        }));
      }, 500);

      return updatedVolumes;
    }),

  setLastCandle: (symbol, candle) =>
    set((state) => ({
      lastCandle: {
        ...state.lastCandle,
        [symbol]: candle,
      },
    })),
}));
