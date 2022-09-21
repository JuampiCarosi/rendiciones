import { t } from "../trpc";
import { ticketParamsVal } from "../../../shared/types";
import { getNextWednesday } from "../../../utils/helpers";
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
    const parsedPettyCashDates = pettyCashDates.map((ticket) => {
      const date = new Date(ticket.pettyCashDate)
        .toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" })
        .split(" ");
      const parsedDate = `${date[2]} ${date[0]}-${Number(date[0]) + 7}`;
      return { date: ticket.pettyCashDate, label: parsedDate };
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
    const date = new Date(ticket.pettyCashDate)
      .toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" })
      .split(" ");
    const parsedDate = `${date[2]} ${date[0]}-${Number(date[0]) + 7}`;
    return { date: ticket.pettyCashDate, label: parsedDate };
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
