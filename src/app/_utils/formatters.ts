import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/routers/_app";

export const formatStatus = (
  status: inferRouterOutputs<AppRouter>["default"]["getAssetInfo"]["status"]
) => {
  switch (status) {
    case "enabled":
      return "Deposits & withdrawals enabled";
    case "deposit_only":
      return "Withdrawals disabled";
    case "withdrawal_only":
      return "Deposits disabled";
    case "funding_temporarily_disabled":
      return "Funding temporarily disabled";

    default:
      return;
  }
};

export const formatPrice = (value: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return formatter.format(value);
};
