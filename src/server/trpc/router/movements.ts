import { movementsParamsVal } from "../../../shared/types";
import { t } from "../trpc";

export const movementsRouter = t.router({
  createMovement: t.procedure.input(movementsParamsVal).mutation(async ({ input, ctx }) => {
    return ctx.prisma.movements.create({
      data: {
        ...input,
      },
    });
  }),
  getAll: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.movements.findMany({
      orderBy: {
        date: "desc",
      },
    });
  }),
});
