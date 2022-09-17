import { movementsParamsVal } from "../../../shared/types";
import { getNextWednesday } from "../../../utils/helpers";
import { t } from "../trpc";

export const movementsRouter = t.router({
  createMovement: t.procedure.input(movementsParamsVal).mutation(async ({ input, ctx }) => {
    return ctx.prisma.movements.create({
      data: {
        ...input,
        pettyCashDate: getNextWednesday(new Date()),
      },
    });
  }),
  getAll: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.movements.findMany({
      where: {
        OR: [
          {
            fromUser: ctx.session?.user?.id,
          },
          {
            toUser: ctx.session?.user?.id,
          },
        ],
      },
      orderBy: {
        date: "desc",
      },
    });
  }),
});
