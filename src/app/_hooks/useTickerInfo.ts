"use client";

import {
  LastChangeType,
  useWebSocketStore,
} from "~/app/_stores/webSocketStore";
import { ASSET_TICKER_LIST } from "~/common/utils/assetTickerList";
import { useMemo } from "react";
import { useTRPC } from "~/common/trpc/client";
import { useQuery } from "@tanstack/react-query";

const useTickerInfo = () => {
  const trpc = useTRPC();
  const { data: allTickerInfo } = useQuery(
    trpc.default.getAllTickerInfo.queryOptions()
  );

  const wsPrices = useWebSocketStore((state) => state.prices);
  const wsVolumes = useWebSocketStore((state) => state.volumes);

  return useMemo(() => {
    return Object.fromEntries(
      ASSET_TICKER_LIST.map(({ assetSymbol, responseTicker }) => {
        const wsPrice = wsPrices[assetSymbol];
        const wsVolume = wsVolumes[assetSymbol];
        const tickerInfo = allTickerInfo?.[responseTicker];

        return [
          assetSymbol,
          {
            price: {
              value: Number((wsPrice?.value ?? tickerInfo?.price)?.toFixed(2)),
              lastChangeType: wsPrice?.lastChangeType ?? LastChangeType.Default,
            },
            tradingVolume24h: {
              value: Number(
                (wsVolume?.value ?? tickerInfo?.tradingVolume24h)?.toFixed(0)
              ),
              lastChangeType:
                wsVolume?.lastChangeType ?? LastChangeType.Default,
            },
          },
        ];
      })
    );
  }, [allTickerInfo, wsPrices, wsVolumes]);
};

export default useTickerInfo;
