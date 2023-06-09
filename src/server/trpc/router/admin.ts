import { t } from "../trpc";
import { z } from "zod";

export const adminRouter = t.router({
  getCosCenterNames: t.procedure
    .input(z.boolean().optional())
    .query(async ({ ctx, input: filterFinished }) => {
      if (filterFinished !== undefined) {
        return (
          await ctx.prisma.costCenters.findMany({
            where: {
              isFinished: filterFinished ? 1 : 0,
            },
            select: {
              name: true,
            },
          })
        ).map((costCenter) => costCenter.name);
      }

      return (
        await ctx.prisma.costCenters.findMany({
          select: {
            name: true,
          },
        })
      ).map((costCenter) => costCenter.name);
    }),
});
