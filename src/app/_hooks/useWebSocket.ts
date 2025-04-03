import { useEffectOnce } from "react-use";
import { z } from "zod";
import { useWebSocketStore } from "~/app/_stores/webSocketStore";
import { ASSET_TICKER_LIST } from "~/common/utils/assetTickerList";
import { roundToMinute } from "~/common/utils/roundToMinute";
import { hasWebSocketChannel } from "../_utils/hasWebSocketChannel";

const TickerSchema = z.object({
  channel: z.literal("ticker"),
  type: z.literal("update"),
  data: z.array(
    z.object({
      symbol: z.string(),
      last: z.number(),
      volume: z.number(),
    })
  ),
});

const OhlcSchema = z.object({
  channel: z.literal("ohlc"),
  type: z.literal("update"),
  data: z.array(
    z.object({
      symbol: z.string(),
      interval_begin: z.string(),
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      volume: z.number(),
      interval: z.number(),
    })
  ),
});

export const useWebSocket = () => {
  const updatePrice = useWebSocketStore((state) => state.updatePrice);
  const updateVolume = useWebSocketStore((state) => state.updateVolume);
  const setLastCandle = useWebSocketStore((state) => state.setLastCandle);

  useEffectOnce(() => {
    const ws = new WebSocket("wss://ws.kraken.com/v2");

    ws.onopen = () => {
      const tickers = ASSET_TICKER_LIST.map((a) => a.wsTicker);
      ws.send(
        JSON.stringify({
          method: "subscribe",
          params: {
            channel: "ticker",
            symbol: tickers,
          },
        })
      );

      ws.send(
        JSON.stringify({
          method: "subscribe",
          params: {
            channel: "ohlc",
            symbol: tickers,
            interval: 1,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      const json: unknown = JSON.parse(event.data);
      if (!hasWebSocketChannel(json)) return;
      if (json?.type !== "update") return;

      if (json?.channel === "ticker") {
        const tickerParsed = TickerSchema.safeParse(json);
        if (tickerParsed.success) {
          const parsedTickerData = tickerParsed.data.data[0];
          if (!parsedTickerData) return;

          const { symbol, last: price, volume } = parsedTickerData;

          const asset = ASSET_TICKER_LIST.find(
            (item) => item.wsTicker === symbol
          );
          if (!asset) return;

          if (isFinite(price) && price > 0) {
            updatePrice(asset.assetSymbol, price);
          }

          if (isFinite(volume) && volume > 0) {
            updateVolume(asset.assetSymbol, volume);
          }

          return;
        }
      }

      if (json?.channel === "ohlc") {
        const ohlcParsed = OhlcSchema.safeParse(json);
        if (ohlcParsed.success) {
          const parsedOhlcData = ohlcParsed.data.data[0];
          if (!parsedOhlcData) return;

          const {
            symbol,
            interval_begin: time,
            open,
            high,
            low,
            close,
          } = parsedOhlcData;

          const asset = ASSET_TICKER_LIST.find(
            (item) => item.wsTicker === symbol
          );
          if (!asset) return;

          const candle = {
            time: roundToMinute(time),
            open,
            high,
            low,
            close,
          };

          setLastCandle(asset.assetSymbol, candle);
        }
      }
    };

    return () => ws.close();
  });
};
