import { z } from "zod";
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
  getByDate: t.procedure.input(z.date()).query(async ({ ctx, input }) => {
    return ctx.prisma.movements.findMany({
      where: {
        pettyCashDate: getNextWednesday(input),

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
  getAllByDate: t.procedure.input(z.date()).query(async ({ ctx, input }) => {
    return ctx.prisma.movements.findMany({
      where: {
        pettyCashDate: getNextWednesday(input),
      },
      orderBy: {
        date: "desc",
      },
    });
  }),
});
