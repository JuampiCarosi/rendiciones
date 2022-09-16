import { t } from "../trpc";
import { ticketParamsVal } from "../../../shared/types";

const getNextWednesday = (date: Date) => {
  const dayTillWednesday = 3 - date.getDay();
  return new Date(date.setDate(date.getDate() + dayTillWednesday + (dayTillWednesday < 0 ? 7 : 0)));
};

export const ticketsRouter = t.router({
  createTicket: t.procedure.input(ticketParamsVal).mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user) throw new Error("Not logged in");
    const ticketsOnPettyCash = await ctx.prisma.ticket.findMany({
      where: {
        id: ctx.session?.user?.id,
      },
    });
    const ticketId = ticketsOnPettyCash.length + 1;
    return ctx.prisma.ticket.create({
      data: {
        ...input,
        ticketId,
        userName: ctx.session?.user?.name || "usuario generico",
        userId: ctx.session?.user?.id,
        pettyCashDate: getNextWednesday(new Date()),
      },
    });
  }),
  getAll: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.ticket.findMany({
      orderBy: {
        pettyCashDate: "desc",
      },
    });
  }),
});
