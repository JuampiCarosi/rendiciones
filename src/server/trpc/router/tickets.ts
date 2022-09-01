import { t } from "../trpc";
import { z } from "zod";

export const ticketParamsVal = z.object({
  amount: z.number().min(1),
  description: z.string().min(1),
  invoiceDate: z.date(),
  expenseType: z.string().min(1),
  invoiceType: z.string().min(1),
  userName: z.string().min(1),
  costCenter: z.string().min(1),
});

export type TicketParams = z.infer<typeof ticketParamsVal>;

const getNextWednesday = (date: Date) => {
  const dayTillWednesday = 3 - date.getDay();
  return new Date(date.setDate(date.getDate() + dayTillWednesday + (dayTillWednesday < 0 ? 7 : 0)));
};

export const ticketsRouter = t.router({
  createTicket: t.procedure.input(ticketParamsVal).mutation(async ({ input, ctx }) => {
    const ticketsOnPettyCash = await ctx.prisma.ticket.findMany({
      where: {
        userName: input.userName,
      },
    });
    const ticketId = ticketsOnPettyCash.length + 1;
    return ctx.prisma.ticket.create({
      data: {
        ...input,
        ticketId,
        pettyCashDate: getNextWednesday(new Date()),
      },
    });
  }),
});
