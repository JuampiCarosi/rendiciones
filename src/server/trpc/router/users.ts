import { z } from "zod";
import { t } from "../trpc";

export const usersRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    const userData = await ctx.prisma.user.findMany({
      select: { name: true, id: true },
      where: {
        isBanker: false,
      },
    });
    return userData.map((user) => ({
      value: user.id,
      label: user.name,
    }));
  }),
  getAllowedTransfers: t.procedure.query(async ({ ctx }) => {
    const userData = await ctx.prisma.user.findMany({
      where: {
        OR: [
          {
            id: ctx.session?.user?.id,
          },
          ctx.session?.user?.isAdmin
            ? {
                isBanker: true,
              }
            : {},
        ],
      },
      select: { name: true, id: true },
    });
    return userData.map((user) => ({
      value: user.id,
      label: user.name,
    }));
  }),
  getById: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: input,
      },
      select: { name: true },
    });
    return user;
  }),
  getBankersId: t.procedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        isBanker: true,
      },
      select: { id: true },
    });
    return users.map((id) => id.id);
  }),
  getEmployeesId: t.procedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        isEmployee: true,
      },
      select: { id: true },
    });
    return users.map((id) => id.id);
  }),
});
