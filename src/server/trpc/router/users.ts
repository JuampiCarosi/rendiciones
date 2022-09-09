import { t } from "../trpc";

export const usersRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    const userData = await ctx.prisma.user.findMany({
      select: { name: true, id: true },
      where: {
        id: {
          not: process.env.ADMIN_ID,
        },
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
          {
            id: process.env.ADMIN_ID,
          },
        ],
      },
      select: { name: true, id: true },
    });
    return userData.map((user) => ({
      value: user.id,
      label: user.name,
    }));
  }),
});
