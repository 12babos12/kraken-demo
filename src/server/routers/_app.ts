import { defaultRouter } from "~/server/routers/default";
import { createCallerFactory, createTRPCRouter } from "../../common/trpc/init";

export const appRouter = createTRPCRouter({
  default: defaultRouter,
});
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
