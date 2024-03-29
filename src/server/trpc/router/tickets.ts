import { t } from "../trpc";
import { ticketParamsVal } from "../../../shared/types";
import { getNextWednesday } from "../../../utils/helpers";
import { z } from "zod";
import { Ticket, User } from "@prisma/client";

const editTicketsVal = ticketParamsVal.extend({
  id: z.string(),
});

export const ticketsRouter = t.router({
  createTicket: t.procedure.input(ticketParamsVal).mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user) throw new Error("Not logged in");
    const ticketsOnPettyCash = await ctx.prisma.ticket.findMany({
      where: {
        userId: ctx.session?.user?.id,
        pettyCashDate: getNextWednesday(new Date()),
      },
    });
    const ticketId = ticketsOnPettyCash.length + 1;
    return ctx.prisma.ticket.create({
      data: {
        ...input,
        costCenter: input.costCenter || "N/A",
        ticketId,
        userName: ctx.session?.user?.name || "usuario generico",
        userId: ctx.session?.user?.id,
        pettyCashDate: getNextWednesday(new Date()),
        hasQR: input.hasQR ?? false,
      },
    });
  }),
  getByDate: t.procedure.input(z.date()).query(async ({ ctx, input }) => {
    return ctx.prisma.ticket.findMany({
      where: {
        pettyCashDate: getNextWednesday(input),
        userId: ctx.session?.user?.id,
      },
      orderBy: {
        ticketId: "desc",
      },
    });
  }),
  getAllByDate: t.procedure.input(z.date()).query(async ({ ctx, input }) => {
    return ctx.prisma.ticket.findMany({
      where: {
        pettyCashDate: getNextWednesday(input),
      },
      orderBy: {
        ticketId: "asc",
      },
    });
  }),
  getById: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.prisma.ticket.findUnique({
      where: {
        id: input,
      },
    });
  }),
  editTicket: t.procedure.input(editTicketsVal).mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user) throw new Error("Not logged in");
    return await ctx.prisma.ticket.update({
      where: {
        id: input.id,
      },
      data: {
        amount: input.amount,
        description: input.description,
        invoiceDate: input.invoiceDate,
        expenseType: input.expenseType,
        invoiceType: input.invoiceType,
        costCenter: input.costCenter,
        hasQR: input.hasQR,
      },
    });
  }),
  deleteTicket: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    await ctx.prisma.ticket.delete({
      where: {
        id: input,
      },
    });
  }),
  getAllAfip: t.procedure.query(async ({ ctx }) => {
    const a = await ctx.prisma.$queryRaw`
    SELECT * FROM Ticket a
    LEFT JOIN User b ON b.id = a.userId
    WHERE invoiceType = 'A'
    `;

    return a as Array<Ticket & User>;
  }),
});
