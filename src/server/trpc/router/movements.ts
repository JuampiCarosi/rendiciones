import { t } from "../trpc";
import { z } from "zod";

export const movementsParamsVal = z.object({
  amount: z.number().min(1),
  description: z.string().min(1),
  fromUser: z.string().min(1),
  toUser: z.string().min(1),
  date: z.date(),
});

export const movementsRouter = t.router({
  createMovement: t.procedure.input(movementsParamsVal).mutation(async ({ input, ctx }) => {
    console.log(ctx.prisma);
    return ctx.prisma.movements.create({
      data: {
        ...input,
      },
    });
  }),
});
