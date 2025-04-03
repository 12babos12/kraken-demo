"use client";

import useTickerInfo from "~/app/_hooks/useTickerInfo";
import styles from "./AssetTable.module.scss";
import { useSearchParams } from "next/navigation";
import { ASSET_TICKER_LIST } from "~/common/utils/assetTickerList";
import { useRouter } from "next/navigation";
import { formatPrice } from "../../_utils/formatters";
import { LastChangeType } from "../../_stores/webSocketStore";

export function AssetTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedAssetSymbol = searchParams.get("asset");
  const tickerInfo = useTickerInfo();

  return (
    <table className={styles.assetTable}>
      <thead>
        <tr>
          <th>Asset</th>
          <th>Price</th>
          <th>24h Volume</th>
        </tr>
      </thead>
      <tbody>
        {ASSET_TICKER_LIST.map(({ assetSymbol, assetName, color }) => {
          const info = tickerInfo[assetSymbol];
          const lastPriceChangeType = info?.price.lastChangeType;
          const lastVolumeChangeType = info?.tradingVolume24h.lastChangeType;

          return (
            <tr
              key={assetSymbol}
              className={`${styles.assetTableRow} ${
                assetSymbol === selectedAssetSymbol
                  ? styles.selectedAssetTableRow
                  : ""
              }`}
              onClick={() => {
                router.push(`/dashboard?asset=${assetSymbol}`);
              }}
            >
              <td>
                <span className={styles.assetName}>{assetName}</span>{" "}
                <span className={styles.assetSymbol} style={{ color: color }}>
                  {assetSymbol.toUpperCase()}
                </span>
              </td>
              <td
                className={
                  lastPriceChangeType === LastChangeType.Up
                    ? styles["flash-up"]
                    : lastPriceChangeType === LastChangeType.Down
                    ? styles["flash-down"]
                    : ""
                }
              >
                {info?.price !== undefined
                  ? `${formatPrice(info.price.value)}`
                  : "—"}
              </td>
              <td
                className={
                  lastVolumeChangeType === LastChangeType.Up
                    ? styles["flash-up"]
                    : lastVolumeChangeType === LastChangeType.Down
                    ? styles["flash-down"]
                    : ""
                }
              >
                {info?.tradingVolume24h !== undefined ? (
                  <>
                    {info.tradingVolume24h.value.toLocaleString()}{" "}
                    {assetSymbol.toUpperCase()}
                  </>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
