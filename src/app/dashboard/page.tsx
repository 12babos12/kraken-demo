import { HydrateClient } from "~/common/trpc/server";
import styles from "./dashboard.module.scss";

export default async function DashboardPage() {
  return (
    <HydrateClient>
      <main className={styles.dashboardPageContainer}></main>
    </HydrateClient>
  );
}
