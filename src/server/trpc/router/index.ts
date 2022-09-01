// src/server/trpc/router/index.ts
import { t } from "../trpc";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { ticketsRouter } from "./tickets";
import { usersRouter } from "./users";
import { movementsRouter } from "./movements";

export const appRouter = t.router({
  example: exampleRouter,
  auth: authRouter,
  tickets: ticketsRouter,
  users: usersRouter,
  movements: movementsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
