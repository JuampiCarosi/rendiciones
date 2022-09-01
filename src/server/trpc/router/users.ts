import { t } from "../trpc";

export const usersRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    const userData = await ctx.prisma.user.findMany({
      select: { name: true, email: true },
    });
    return userData.map((user) => ({
      value: user.email,
      label: user.name,
    }));
  }),
});
