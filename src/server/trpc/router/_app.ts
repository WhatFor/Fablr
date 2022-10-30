import { router } from "../trpc";
import { authRouter } from "./auth";
import { gamesRouter } from "./games";

export const appRouter = router({
  auth: authRouter,
  games: gamesRouter,
});

export type AppRouter = typeof appRouter;
