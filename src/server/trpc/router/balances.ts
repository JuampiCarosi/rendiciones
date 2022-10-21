import { Movements, Ticket } from "@prisma/client";
import { z } from "zod";
import { parsePettyCashDate } from "../../../utils/helpers";
import { t } from "../trpc";
import ExcelJS from "exceljs";
import { ticketsRouter } from "./tickets";
import { ParsedTicket } from "../../../shared/types";
import { movementsRouter } from "./movements";

const sheetColumns = [
  { header: "ID", key: "ticketId", width: 16 },
  { header: "Fecha", key: "invoiceDate", width: 16 },
  { header: "Tipo de ticket", key: "invoiceType", width: 16 },
  { header: "Descripción", key: "description", width: 16 },
  { header: "Centro de costos", key: "costCenter", width: 16 },
  { header: "Tipo de gasto", key: "expenseType", width: 16 },
  { header: "Salida de caja", key: "cashOut", width: 16 },
  { header: "Ingreso de caja", key: "cashIn", width: 16 },
];

type ExcelTicket = Omit<Ticket, " amount"> & { cashOut: number; cashIn: number };
type ExcelMovement = Omit<Movements, "amount"> & { cashOut: number; cashIn: number };

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
      if (movement.fromUser === ctx.session?.user?.id) {
        balance -= movement.amount;
      } else {
        balance += movement.amount;
      }
    });

    return balance;
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
  generateReport: t.procedure.input(z.date()).query(async ({ ctx, input }) => {
    const users = await ctx.prisma.user.findMany();
    const reports: Array<{
      userId: string;
      name?: string;
      pettyCash: string;
      tickets: ExcelTicket[];
      balance: number;
      movements: ExcelMovement[];
    }> = [];
    const balancesCaller = balancesRouter.createCaller(ctx);
    const ticketCaller = ticketsRouter.createCaller(ctx);
    const movementsCaller = movementsRouter.createCaller(ctx);

    const tickets = await ticketCaller.getAllByDate(input);
    const movements = await movementsCaller.getAllByDate(input);
    // console.log("tickets: ", tickets, input);

    await Promise.all(
      users.map(async (user) => {
        const report = {
          name: user.name ?? undefined,
          pettyCash: parsePettyCashDate(input).label,
          tickets: [],
          movements: [],
          userId: user.id,
          balance: (await balancesCaller.getBalance(user.id)) ?? 0,
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
      const report = reports.find((r) => {
        return r.userId === movement.fromUser || r.userId === movement.toUser;
      });
      if (report) {
        if (report.userId === movement.fromUser)
          report.movements.push({ ...movement, cashOut: movement.amount * -1, cashIn: 0 });
        else report.movements.push({ ...movement, cashOut: 0, cashIn: movement.amount });
      }
    });

    const workbook = new ExcelJS.Workbook();

    reports.forEach((report) => {
      const sheet = workbook.addWorksheet(report.name ?? report.userId);
      sheet.columns = sheetColumns;
      sheet.addRows(report.tickets);
      sheet.addRows(report.movements);
    });
    await workbook.xlsx.writeFile("public/balances.xlsx");
    return reports;
  }),
});
