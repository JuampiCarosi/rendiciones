import { Movements, Ticket } from "@prisma/client";
import { z } from "zod";
import { parsePettyCashDate } from "../../../utils/helpers";
import { t } from "../trpc";
import ExcelJS from "exceljs";
import { ticketsRouter } from "./tickets";
import { movementsRouter } from "./movements";
import date from "date-and-time";
import { costCenterTypes } from "../../../components/Ticket/Modal";

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

const costCenterSheetColumns = [
  { header: "Centro de costos", key: "costCenter", width: 16 },
  { header: "Monto", key: "amount", width: 16 },
];

type CostCenter = typeof costCenterTypes[number];

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
  getBalanceByDate: t.procedure
    .input(z.object({ userId: z.string().optional(), date: z.date() }))
    .query(async ({ ctx, input }) => {
      const tickets = await ctx.prisma.ticket.findMany({
        where: {
          userId: input.userId ?? ctx.session?.user?.id,
          pettyCashDate: parsePettyCashDate(input.date).date,
        },
      });
      const movements = await ctx.prisma.movements.findMany({
        where: {
          pettyCashDate: parsePettyCashDate(input.date).date,

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
  getCostCenterBalances: t.procedure.input(z.date()).query(async ({ ctx, input }) => {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        pettyCashDate: parsePettyCashDate(input).date,
      },
    });
    const balance: { costCenter: CostCenter; amount: number }[] = [];

    tickets.forEach((ticket: Ticket) => {
      const costCenter = JSON.parse(ticket.costCenter);
      costCenter.forEach((c: CostCenter) => {
        const index = balance.findIndex((item) => item.costCenter === c);
        if (index === -1) {
          balance.push({ costCenter: c as CostCenter, amount: ticket.amount });
        } else {
          // eslint-disable-next-line
          // @ts-ignore
          balance[index].amount += ticket.amount / costCenter.length;
        }
      });
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
      prevBalance: number;
    }> = [];
    const balancesCaller = balancesRouter.createCaller(ctx);
    const ticketCaller = ticketsRouter.createCaller(ctx);
    const movementsCaller = movementsRouter.createCaller(ctx);

    const tickets = await ticketCaller.getAllByDate(input);
    const movements = await movementsCaller.getAllByDate(input);

    await Promise.all(
      users.map(async (user) => {
        const report = {
          name: user.name ?? undefined,
          pettyCash: parsePettyCashDate(input).label,
          tickets: [],
          movements: [],
          userId: user.id,
          balance: (await balancesCaller.getBalanceByDate({ userId: user.id, date: input })) ?? 0,
          prevBalance:
            (await balancesCaller.getBalanceByDate({ userId: user.id, date: date.addDays(input, -7) })) ?? 0,
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
        if (report.userId === movement.fromUser) {
          report.movements.push({ ...movement, cashOut: movement.amount * -1, cashIn: 0 });
        } else {
          report.movements.push({ ...movement, cashOut: 0, cashIn: movement.amount });
        }
      }
    });

    const workbook = new ExcelJS.Workbook();

    reports.forEach((report) => {
      const sheet = workbook.addWorksheet(report.name ?? report.userId);
      sheet.columns = sheetColumns;
      sheet.addRows(report.tickets);
      sheet.addRows(report.movements);

      const referenceRow = sheet.rowCount;

      sheet.getCell(`D${referenceRow + 3}`).value = "Totales";
      sheet.getCell(`D${referenceRow + 4}`).value = "Saldo anterior";
      sheet.getCell(`D${referenceRow + 5}`).value = "Caja asignada";
      sheet.getCell(`D${referenceRow + 6}`).value = "Reposicion de caja";

      sheet.getCell(`G${referenceRow + 3}`).value = {
        formula: `SUM(G2:G${referenceRow + 1})`,
        date1904: false,
      };
      sheet.getCell(`H${referenceRow + 3}`).value = {
        formula: `SUM(H2:H${referenceRow + 1})`,
        date1904: false,
      };
      sheet.getCell(`I${referenceRow + 3}`).value = {
        formula: `SUM(G${referenceRow + 3},H${referenceRow + 3})`,
        date1904: false,
      };
      sheet.getCell(`I${referenceRow + 4}`).value = report.prevBalance;
      sheet.getCell(`I${referenceRow + 6}`).value = {
        formula: `I${referenceRow + 5} - I${referenceRow + 4} - I${referenceRow + 3}`,
        date1904: false,
      };
    });
    const costCenterSheet = workbook.addWorksheet("Resumen de centros de costo");
    costCenterSheet.columns = costCenterSheetColumns;
    costCenterSheet.addRows(await balancesCaller.getCostCenterBalances(input));

    await workbook.xlsx.writeFile("public/balances.xlsx");
    return reports;
  }),
});
