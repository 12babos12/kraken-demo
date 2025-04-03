import { getQueryClient, HydrateClient, trpc } from "~/common/trpc/server";
import { ASSET_TICKER_LIST } from "~/common/utils/assetTickerList";
import styles from "./dashboard.module.scss";
import { redirect } from "next/navigation";

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
      <main className={styles.dashboardPageContainer}></main>
    </HydrateClient>
  );
}
