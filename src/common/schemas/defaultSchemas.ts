import { z } from "zod";

export const assetSchema = z.object({
  result: z.record(
    z.string(),
    z.object({
      status: z.enum([
        "enabled",
        "deposit_only",
        "withdrawal_only",
        "funding_temporarily_disabled",
      ]),
    })
  ),
});

export const tickerSchema = z.object({
  result: z.record(
    z.string(),
    z.object({
      c: z.array(z.string()),
      v: z.array(z.string()),
    })
  ),
});

const candleSchema = z.tuple([
  z.number(), // time
  z.string(), // open
  z.string(), // high
  z.string(), // low
  z.string(), // close
  z.string().optional(), // vwap
  z.string().optional(), // volume
  z.number().optional(), // count
]);
export type RawCandle = z.infer<typeof candleSchema>;

export const ohlcResponseSchema = z.object({
  result: z.record(z.string(), z.union([z.array(candleSchema), z.number()])),
});
