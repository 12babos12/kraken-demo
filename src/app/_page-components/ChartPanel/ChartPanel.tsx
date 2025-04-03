"use client";

import {
  createChart,
  CandlestickSeries,
  type ISeriesApi,
  type IChartApi,
  AreaSeries,
  LineSeries,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import styles from "./ChartPanel.module.scss";
import { useWebSocketStore } from "../../_stores/webSocketStore";
import { useSearchParams } from "next/navigation";
import { ASSET_TICKER_LIST } from "~/common/utils/assetTickerList";
import { useTRPC } from "~/common/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, formatStatus } from "../../_utils/formatters";
import { calcMaLastDataPoint, calcMaSeriesData } from "~/app/_utils/maHelpers";

export default function ChartPanel() {
  const trpc = useTRPC();
  const searchParams = useSearchParams();
  const selectedAssetSymbol =
    searchParams.get("asset") ?? ASSET_TICKER_LIST[0].assetSymbol;
  const selectedAsset =
    ASSET_TICKER_LIST.find(
      (item) => item.assetSymbol === selectedAssetSymbol
    ) ?? ASSET_TICKER_LIST[0];

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const highlightRef = useRef<ISeriesApi<"Area"> | null>(null);
  const ma10Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ma20Ref = useRef<ISeriesApi<"Line"> | null>(null);

  const { data: initialOhlcData } = useQuery(
    trpc.default.getOHLC.queryOptions({
      ticker: selectedAsset.requestTicker,
    })
  );

  const { data: assetInfo } = useQuery(
    trpc.default.getAssetInfo.queryOptions({
      asset: selectedAsset.assetInfoKey,
    })
  );

  const lastCandle = useWebSocketStore(
    (state) => state.lastCandle[selectedAssetSymbol]
  );

  useEffect(() => {
    if (!chartContainerRef.current || !initialOhlcData?.length) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "rgb(34, 0, 97)" },
        textColor: "#DDD",
        fontSize: 14,
      },
      grid: {
        vertLines: { color: "#444" },
        horzLines: { color: "#444" },
      },
    });
    chartRef.current = chart;

    const ma10Data = calcMaSeriesData(initialOhlcData, 10);
    const ma10Series = chart.addSeries(LineSeries, {
      color: "#00ccff",
      lineWidth: 2,
    });
    ma10Series.setData(ma10Data);
    ma10Ref.current = ma10Series;

    const ma20Data = calcMaSeriesData(initialOhlcData, 20);
    const ma20Series = chart.addSeries(LineSeries, {
      color: "#fbff00",
      lineWidth: 4,
    });
    ma20Series.setData(ma20Data);
    ma20Ref.current = ma20Series;

    const lineData = initialOhlcData.map((dataPoint) => ({
      time: dataPoint.time,
      value: (dataPoint.close + dataPoint.open) / 2,
    }));
    const areaSeries = chart.addSeries(AreaSeries, {
      lastValueVisible: false,
      crosshairMarkerVisible: false,
      lineColor: "transparent",
      topColor: "rgba(77, 17, 245, 0.6)",
      bottomColor: "rgba(77, 17, 245, 0.1)",
    });
    areaSeries.setData(lineData);
    highlightRef.current = areaSeries;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candlestickSeries.setData(initialOhlcData);
    seriesRef.current = candlestickSeries;

    chart.applyOptions({
      localization: {
        priceFormatter: (value: number) => formatPrice(value),
      },
    });

    chart.timeScale().applyOptions({
      fixLeftEdge: true,
      fixRightEdge: true,
      timeVisible: true,
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      ma10Ref.current = null;
      ma20Ref.current = null;
      highlightRef.current = null;
      seriesRef.current = null;
    };
  }, [initialOhlcData]);

  useEffect(() => {
    if (
      !lastCandle ||
      !seriesRef.current ||
      !highlightRef.current ||
      !ma10Ref.current ||
      !ma20Ref.current
    ) {
      return;
    }

    seriesRef.current.update(lastCandle);

    highlightRef.current.update({
      time: lastCandle.time,
      value: (lastCandle.close + lastCandle.open) / 2,
    });

    const ma10 = calcMaLastDataPoint([...seriesRef.current.data()], 10);
    if (ma10) ma10Ref.current.update(ma10);

    const ma20 = calcMaLastDataPoint([...seriesRef.current.data()], 20);
    if (ma20) ma20Ref.current.update(ma20);
  }, [lastCandle]);

  return (
    <section className={styles.chartPanelContainer}>
      <div className={styles.chartPanelHeader}>
        <p>{selectedAsset.requestTicker}</p>
        <div className={styles.statusInfoContainer}>
          <p
            className={styles.statusText}
            style={{
              color: assetInfo?.status === "enabled" ? "#26a69a" : "#ef5350",
            }}
          >
            {formatStatus(assetInfo?.status)}
          </p>
          <span
            className={styles.statusIcon}
            style={{
              backgroundColor:
                assetInfo?.status === "enabled" ? "#26a69a" : "#ef5350",
            }}
          />
        </div>
      </div>
      <div ref={chartContainerRef} className={styles.chartContainer} />
    </section>
  );
}
