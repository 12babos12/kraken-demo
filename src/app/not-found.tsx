"use client";

import { useRouter } from "next/navigation";
import styles from "./index.module.scss";

function NotFoundPage() {
  const router = useRouter();

  return (
    <main className={styles.notFoundPageContainer}>
      <h1>Page not found</h1>
      <button
        className={styles.dashboardButton}
        onClick={() => router.push(`/dashboard?asset=btc`)}
      >
        Go to Dashboard
      </button>
    </main>
  );
}

export default NotFoundPage;
