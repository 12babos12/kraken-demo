import { getQueryClient, HydrateClient, trpc } from "~/common/trpc/server";
import { ASSET_TICKER_LIST } from "~/common/utils/assetTickerList";
import { AssetTable } from "~/app/_page-components/AssetTable/AssetTable";
import styles from "./dashboard.module.scss";
import { redirect } from "next/navigation";
import ChartPanel from "../_page-components/ChartPanel/ChartPanel";
import Image from "next/image";

export default async function DashboardPage(dashboardProps: {
  searchParams?: Promise<{
    asset?: string;
  }>;
}) {
  const searchParams = await dashboardProps.searchParams;
  const selectedAssetSymbol = searchParams?.asset;
  if (!selectedAssetSymbol) {
    redirect(`/dashboard?asset=${ASSET_TICKER_LIST[0].assetSymbol}`);
  }

  const currentAsset = ASSET_TICKER_LIST.find(
    (item) => item.assetSymbol === selectedAssetSymbol
  );

  if (!currentAsset) return { notFound: true };

  const otherAssets = ASSET_TICKER_LIST.filter(
    (item) => item.assetSymbol !== currentAsset.assetSymbol
  );

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(trpc.default.getAllTickerInfo.queryOptions()),
    queryClient.prefetchQuery(
      trpc.default.getAssetInfo.queryOptions({
        asset: currentAsset.assetInfoKey,
      })
    ),
    queryClient.prefetchQuery(
      trpc.default.getOHLC.queryOptions({
        ticker: currentAsset.requestTicker,
      })
    ),
  ]);

  void Promise.all(
    otherAssets.map(({ assetInfoKey }) =>
      trpc.default.getAssetInfo.queryOptions({
        asset: assetInfoKey,
      })
    )
  );

  return (
    <HydrateClient>
      <main className={styles.dashboardPageContainer}>
        <section className={styles.titleContainer}>
          <Image
            src="/kraken-logo.svg"
            alt="Kraken"
            width={215}
            height={50}
            priority
          />
          <h1 className={styles.title}>Demo</h1>
        </section>
        <section className={styles.dashboardPanelsContainer}>
          <AssetTable />
          <ChartPanel />
        </section>
        <section className={styles.promoContainer}>
          <h2>Powered by</h2>
          <div className={styles.promoInnerContainer}>
            <div className={styles.promoElement}>
              <Image
                src="/kraken-logo.svg"
                alt="Kraken"
                width={94}
                height={22}
              />
              <h3>REST API</h3>
            </div>
            <div className={styles.promoElement}>
              <Image
                src="/kraken-logo.svg"
                alt="Kraken"
                width={94}
                height={22}
              />
              <h3>WebSocket API v2</h3>
            </div>
            <div
              className={styles.promoElement}
              data-tooltip="Copyright (c) 2025 TradingView, Inc. https://www.tradingview.com/"
            >
              <Image
                src="/tradingview-logo.svg"
                alt="Kraken"
                width={150}
                height={22}
              />
              <h3>Lightweight Charts™</h3>
            </div>
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
