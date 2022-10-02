import { t } from "../trpc";
import { ticketParamsVal } from "../../../shared/types";
import { getNextWednesday, parsePettyCashDate } from "../../../utils/helpers";
import { z } from "zod";

export const ticketsRouter = t.router({
  createTicket: t.procedure.input(ticketParamsVal).mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user) throw new Error("Not logged in");
    const ticketsOnPettyCash = await ctx.prisma.ticket.findMany({
      where: {
        userId: ctx.session?.user?.id,
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
  getPettyCashDates: t.procedure.query(async ({ ctx }) => {
    const pettyCashDates = await ctx.prisma.ticket.findMany({
      where: {
        userId: ctx.session?.user?.id,
      },
      orderBy: {
        pettyCashDate: "desc",
      },
      distinct: ["pettyCashDate"],
    });
    if (pettyCashDates.length === 0) return [{ date: new Date(), label: "No hay cajas" }];
    const parsedPettyCashDates = pettyCashDates.map((ticket) => {
      return parsePettyCashDate(ticket.pettyCashDate);
    });
    if (parsedPettyCashDates.length > 5) {
      return parsedPettyCashDates.slice(0, 5);
    }
    return parsedPettyCashDates;
  }),
  getCurrentPettyCash: t.procedure.query(async ({ ctx }) => {
    const ticket = await ctx.prisma.ticket.findFirst({
      where: {
        userId: ctx.session?.user?.id,
      },
      orderBy: {
        pettyCashDate: "desc",
      },
      distinct: ["pettyCashDate"],
    });
    if (!ticket) return { date: new Date(), label: "No hay cajas" };
    return parsePettyCashDate(ticket.pettyCashDate);
  }),
  getByDate: t.procedure.input(z.date()).query(async ({ ctx, input }) => {
    return ctx.prisma.ticket.findMany({
      where: {
        pettyCashDate: input,
        userId: ctx.session?.user?.id,
      },
      orderBy: {
        pettyCashDate: "desc",
      },
    });
  }),
});
