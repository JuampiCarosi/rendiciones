import { t } from "../trpc";
import { z } from "zod";

const ticketParamsVal = z.object({
  amount: z.number(),
  description: z.string(),
  invoiceDate: z.string(),
  expenseType: z.string(),
  invoiceType: z.string(),
  pettyCash: z.string(),
  userName: z.string(),
  costCenter: z.string(),
});

export type TicketParams = z.infer<typeof ticketParamsVal>;

export const ticketsRouter = t.router({
  createTicket: t.procedure.input(ticketParamsVal).mutation(async ({ input, ctx }) => {
    const ticketsOnPettyCash = await ctx.prisma.ticket.findMany({
      where: {
        userName: input.userName,
        pettyCash: input.pettyCash,
      },
    });
    const ticketId = ticketsOnPettyCash.length + 1;
    return ctx.prisma.ticket.create({
      data: {
        ...input,
        ticketId,
      },
    });
  }),
});
