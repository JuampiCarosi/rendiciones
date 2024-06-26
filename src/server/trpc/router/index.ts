// src/server/trpc/router/index.ts
import { t } from "../trpc";
import { authRouter } from "./auth";
import { ticketsRouter } from "./tickets";
import { usersRouter } from "./users";
import { movementsRouter } from "./movements";
import { balancesRouter } from "./balances";
import { pettyCashRouter } from "./pettyCash";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { adminRouter } from "./admin";

export const appRouter = t.router({
  auth: authRouter,
  tickets: ticketsRouter,
  users: usersRouter,
  movements: movementsRouter,
  balances: balancesRouter,
  pettyCash: pettyCashRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
