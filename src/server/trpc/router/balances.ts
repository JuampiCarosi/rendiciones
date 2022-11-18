import { Movements, Ticket } from "@prisma/client";
import { z } from "zod";
import { getNextWednesday, parsePettyCashDate } from "../../../utils/helpers";
import { t } from "../trpc";
import { ticketsRouter } from "./tickets";
import { movementsRouter } from "./movements";
import date from "date-and-time";
import { costCenterTypes, Report } from "../../../shared/types";

type CostCenter = typeof costCenterTypes[number];

export const balancesRouter = t.router({
  getBalance: t.procedure.input(z.string().optional()).query(async ({ ctx, input }) => {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        userId: input ?? ctx.session?.user?.id,
      },
    });
    const movements = await ctx.prisma.movements.findMany({
      where: {
        OR: [
          {
            fromUser: input ?? ctx.session?.user?.id,
          },
          {
            toUser: input ?? ctx.session?.user?.id,
          },
        ],
      },
    });
    let balance = 0;

    tickets.forEach((ticket: Ticket) => {
      balance -= ticket.amount;
    });
    movements.forEach((movement: Movements) => {
      if (movement.fromUser === (input ?? ctx.session?.user?.id)) {
        balance -= movement.amount;
      } else {
        balance += movement.amount;
      }
    });

    return balance;
  }),
  getPrevBalance: t.procedure
    .input(z.object({ userId: z.string(), date: z.date() }))
    .query(async ({ ctx, input }) => {
      let balance = 0;
      let date = input.date;
      while (date.getTime() > new Date(2022, 9, 19).getTime()) {
        const tickets = await ctx.prisma.ticket.findMany({
          where: {
            userId: input.userId ?? ctx.session?.user?.id,
            pettyCashDate: getNextWednesday(date),
          },
        });
        const movements = await ctx.prisma.movements.findMany({
          where: {
            pettyCashDate: getNextWednesday(date),

            OR: [
              {
                fromUser: input.userId ?? ctx.session?.user?.id,
              },
              {
                toUser: input.userId ?? ctx.session?.user?.id,
              },
            ],
          },
        });

        tickets.forEach((ticket: Ticket) => {
          balance -= ticket.amount;
        });
        movements.forEach((movement: Movements) => {
          if (movement.fromUser === (input.userId ?? ctx.session?.user?.id)) {
            balance -= movement.amount;
          } else {
            balance += movement.amount;
          }
        });
        date = new Date(date.setDate(date.getDate() - 7));
      }
      return balance;
    }),
  getCostCenterBalances: t.procedure.input(z.date().optional()).query(async ({ ctx, input }) => {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        pettyCashDate: parsePettyCashDate(input ?? getNextWednesday(new Date())).date,
      },
    });
    const balances: { costCenter: CostCenter; amount: number }[] = [];

    tickets.forEach((ticket: Ticket) => {
      const costCenter = JSON.parse(ticket.costCenter);
      costCenter.forEach((c: CostCenter) => {
        const balance = balances.find((item) => item.costCenter === c);
        if (!balance) {
          balances.push({ costCenter: c as CostCenter, amount: ticket.amount });
        } else {
          balance.amount += ticket.amount / costCenter.length;
        }
      });
    });
    return balances;
  }),
  getAll: t.procedure.query(async ({ ctx }) => {
    const tickets = await ctx.prisma.ticket.findMany();
    const movements = await ctx.prisma.movements.findMany();
    const users = await ctx.prisma.user.findMany();
    const balances: { [key: string]: number } = {};

    users.forEach((user) => {
      balances[user.id] = 0;
    });

    tickets.forEach((ticket: Ticket) => {
      balances[ticket.userId] -= ticket.amount;
    });
    movements.forEach((movement: Movements) => {
      if (movement.fromUser) {
        balances[movement.fromUser] -= movement.amount;
      }
      if (movement.toUser) {
        balances[movement.toUser] += movement.amount;
      }
    });

    const balancesByName = Object.keys(balances).map((key) => {
      const user = users.find((user) => user.id === key);
      return {
        name: user?.name,
        balance: balances[key],
      };
    });

    return balancesByName;
  }),
  generateReport: t.procedure.input(z.date().optional()).query(async ({ ctx, input }) => {
    const inputDate = input ?? new Date(new Date().setDate(new Date().getDate() - 7));
    const users = await ctx.prisma.user.findMany();
    const reports: Report = [];
    const balancesCaller = balancesRouter.createCaller(ctx);
    const ticketCaller = ticketsRouter.createCaller(ctx);
    const movementsCaller = movementsRouter.createCaller(ctx);

    const tickets = await ticketCaller.getAllByDate(inputDate);
    const movements = await movementsCaller.getAllByDate(inputDate);

    await Promise.all(
      users.map(async (user) => {
        const report = {
          name: user.name ?? undefined,
          pettyCash: parsePettyCashDate(inputDate).label,
          tickets: [],
          movements: [],
          userId: user.id,
          balance: (await balancesCaller.getPrevBalance({ userId: user.id, date: inputDate })) ?? 0,
          prevBalance:
            (await balancesCaller.getPrevBalance({ userId: user.id, date: date.addDays(inputDate, -7) })) ??
            0,
        };
        reports.push(report);
      })
    );

    tickets.forEach((ticket) => {
      const report = reports.find((r) => r.userId === ticket.userId);
      if (report) {
        report.tickets.push({
          ...ticket,
          costCenter: ticket.costCenter.join(", "),
          cashOut: ticket.amount * -1,
          cashIn: 0,
        });
      }
    });

    movements.forEach((movement) => {
      const affectedReports = reports.filter((r) => {
        return r.userId === movement.fromUser || r.userId === movement.toUser;
      });

      affectedReports.forEach((report) => {
        if (report.userId === movement.fromUser) {
          report.movements.push({ ...movement, cashOut: movement.amount * -1, cashIn: 0 });
        } else {
          report.movements.push({ ...movement, cashOut: 0, cashIn: movement.amount });
        }
      });
    });

    return reports;
  }),
});
