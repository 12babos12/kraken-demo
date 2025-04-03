"use client";

import { useRouter } from "next/navigation";
import styles from "./index.module.scss";
import { ASSET_TICKER_LIST } from "~/common/utils/assetTickerList";

function NotFoundPage() {
  const router = useRouter();

  return (
    <main className={styles.notFoundPageContainer}>
      <h1>Page not found</h1>
      <button
        className={styles.dashboardButton}
        onClick={() =>
          router.push(`/dashboard?asset=${ASSET_TICKER_LIST[0].assetSymbol}`)
        }
      >
        Go to Dashboard
      </button>
    </main>
  );
}

export default NotFoundPage;
