import { Movements, Ticket } from "@prisma/client";
import { t } from "../trpc";

export const balancesRouter = t.router({
  getBalance: t.procedure.query(async ({ ctx }) => {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        id: ctx.session?.user?.id,
      },
    });
    const movements = await ctx.prisma.movements.findMany({
      where: {
        OR: [
          {
            fromUser: ctx.session?.user?.id,
          },
          {
            toUser: ctx.session?.user?.id,
          },
        ],
      },
    });
    let balance = 0;
    tickets.forEach((ticket: Ticket) => {
      balance += ticket.amount;
    });
    movements.forEach((movement: Movements) => {
      if (movement.fromUser === ctx.session?.user?.id) {
        balance -= movement.amount;
      } else {
        balance += movement.amount;
      }
    });

    return balance;
  }),
});
