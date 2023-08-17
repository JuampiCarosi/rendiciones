import { t } from "../trpc";
import { z } from "zod";

export const adminRouter = t.router({
  getCosCenters: t.procedure.input(z.boolean().optional()).query(async ({ ctx, input: filterFinished }) => {
    if (filterFinished !== undefined) {
      return await ctx.prisma.costCenters.findMany({
        where: {
          isFinished: filterFinished ? 1 : 0,
        },
      });
    }

    return await ctx.prisma.costCenters.findMany();
  }),
  setCostCenterFinished: t.procedure.input(z.string()).query(async ({ ctx, input: costCenterName }) => {
    const { id: costCenterId } = (await ctx.prisma.costCenters.findFirst({
      where: {
        name: costCenterName,
      },
      select: {
        id: true,
      },
    })) ?? { id: null };

    if (!costCenterId) {
      throw new Error("Cost center not found");
    }

    return await ctx.prisma.costCenters.update({
      where: {
        id: costCenterId,
      },
      data: {
        isFinished: 1,
      },
    });
  }),
  addCostCenter: t.procedure.input(z.string()).mutation(async ({ ctx, input: costCenterName }) => {
    return await ctx.prisma.costCenters.create({
      data: {
        name: costCenterName,
        isFinished: 0,
      },
    });
  }),
  deleteCostCenter: t.procedure.input(z.number()).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.costCenters.delete({
      where: {
        id: input,
      },
    });
  }),
});
