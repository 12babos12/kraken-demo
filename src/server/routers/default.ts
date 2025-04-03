import axios from "axios";
import { z } from "zod";
import { ASSET_TICKER_LIST } from "~/common/utils/assetTickerList";
import {
  assetSchema,
  ohlcResponseSchema,
  type RawCandle,
  tickerSchema,
} from "~/common/schemas/defaultSchemas";
import { createTRPCRouter, publicProcedure } from "../../common/trpc/init";
import { roundToMinute } from "~/common/utils/roundToMinute";

export const defaultRouter = createTRPCRouter({
  getAssetInfo: publicProcedure
    .input(z.object({ asset: z.string() }))
    .query(async ({ input }) => {
      const assetInfoResponse = await axios.get(
        `https://api.kraken.com/0/public/Assets?asset=${input.asset}`
      );

      const parsedResponse = assetSchema.parse(assetInfoResponse?.data);
      const assetData = Object.values(parsedResponse.result)[0];
      const status = assetData?.status;

      return { status };
    }),

  getAllTickerInfo: publicProcedure.query(async () => {
    const joinedPairs = ASSET_TICKER_LIST.map(
      (item) => item.requestTicker
    ).join(",");

    const response = await axios.get(
      `https://api.kraken.com/0/public/Ticker?pair=${joinedPairs}`
    );

    const parsed = tickerSchema.parse(response.data);

    const result = Object.fromEntries(
      Object.entries(parsed.result).map(([pair, data]) => [
        pair,
        {
          price: Number(data.c[0]),
          tradingVolume24h: Number(data.v[1]),
        },
      ])
    );

    return result;
  }),

  getOHLC: publicProcedure
    .input(
      z.object({
        ticker: z.string(),
        since: z.number().optional(),
        interval: z.number().default(1),
      })
    )
    .query(async ({ input }) => {
      const url = new URL("https://api.kraken.com/0/public/OHLC");
      url.searchParams.append("pair", input.ticker);
      url.searchParams.append("interval", input.interval.toString());

      if (input.since) {
        url.searchParams.append("since", String(input.since));
      }

      const response = await axios.get(url.toString());

      const parsed = ohlcResponseSchema.parse(response.data);
      const raw = Object.values(parsed.result).find(
        Array.isArray
      ) as RawCandle[];

      return raw.map(([time, open, high, low, close]) => ({
        time: roundToMinute(time),
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
      }));
    }),
});
