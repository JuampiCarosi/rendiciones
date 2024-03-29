import { Movements, Ticket } from "@prisma/client";
import { z } from "zod";
import { getNextWednesday, parsePettyCashDate } from "../../../utils/helpers";
import { t } from "../trpc";
import { ticketsRouter } from "./tickets";
import { movementsRouter } from "./movements";
import date from "date-and-time";
import { Report } from "../../../shared/types";
import ExcelJS from "exceljs";
import { readFileSync } from "fs";
import { env } from "../../../env/client.mjs";
import { usersRouter } from "./users";
import { groupBy } from "../../../utils/groupby";
import { isSameYear } from "date-fns";
import { parsePrismaJson } from "../../../utils/parsePrismaJson";

const sheetColumns = [
  { header: "ID", key: "ticketId", width: 16 },
  { header: "Fecha", key: "invoiceDate", width: 16 },
  { header: "Tipo de ticket", key: "invoiceType", width: 16 },
  { header: "Descripción", key: "description", width: 16 },
  { header: "Centro de costos", key: "costCenter", width: 16 },
  { header: "Tipo de gasto", key: "expenseType", width: 16 },
  { header: "Salida de caja", key: "cashOut", width: 16, style: { numFmt: '"$"#,##0.00' } },
  { header: "Ingreso de caja", key: "cashIn", width: 16, style: { numFmt: '"$"#,##0.00' } },
];

const sheetAfipColumns: Partial<ExcelJS.Column>[] = [
  { header: "Fecha", key: "invoiceDate", width: 10 },
  { header: "Tipo de ticket", key: "invoiceType", width: 5 },
  { header: "Descripción", key: "description", width: 16 },
  { header: "Monto Registrado", key: "amount", width: 15, style: { numFmt: '"$"#,##0.00' } },
  { header: "Punto de venta", key: "pointOfSale", width: 14 },
  { header: "Número de comprobante", key: "invoiceNumber", width: 14 },
  { header: "CUIT", key: "cuit", width: 16 },
  { header: "Denominacion Emisor", key: "emmiterDenomitation", width: 20 },
  { header: "Neto gravado", key: "netoGravado", width: 14, style: { numFmt: '"$"#,##0.00' } },
  { header: "Neto no gravado", key: "netoNoGravado", width: 12, style: { numFmt: '"$"#,##0.00' } },
  { header: "Operaciones Extentas", key: "operacionesExentas", width: 10, style: { numFmt: '"$"#,##0.00' } },
  { header: "IVA 21%", key: "iva21", width: 10, style: { numFmt: '"$"#,##0.00' } },
  { header: "IVA 10.5%", key: "iva105", width: 10, style: { numFmt: '"$"#,##0.00' } },
  { header: "Percepciones IVA", key: "percepcionesIva", width: 10, style: { numFmt: '"$"#,##0.00' } },
  { header: "Percep IIBB CABA", key: "percepcionesIIBBCABA", width: 10, style: { numFmt: '"$"#,##0.00' } },
  { header: "Percep IIBB BSAS", key: "percepcionesIIBBBSAS", width: 10, style: { numFmt: '"$"#,##0.00' } },
  {
    header: "Impuestos Internos / Otros",
    key: "impuestosInternos",
    width: 10,
    style: { numFmt: '"$"#,##0.00' },
  },
  { header: "Monto Total", key: "total", width: 16, style: { numFmt: '"$"#,##0.00' } },
];

const costCenterSheetColumns = [
  { header: "Centro de costos", key: "costCenter", width: 16 },
  { header: "Monto", key: "amount", width: 16 },
];

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
      while (date.getTime() > new Date(2022, 9, 18).getTime()) {
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
    const usersCaller = usersRouter.createCaller(ctx);

    const employees = await usersCaller.getEmployeesId();

    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        pettyCashDate: parsePettyCashDate(input ?? getNextWednesday(new Date())).date,
        userId: { in: employees },
      },
    });
    const balances: { costCenter: string; amount: number }[] = [];

    tickets.forEach((ticket: Ticket) => {
      const costCenter = parsePrismaJson(ticket.costCenter) as string[];
      costCenter?.forEach((c: string) => {
        const balance = balances.find((item) => item.costCenter === c);
        if (!balance) {
          balances.push({ costCenter: c, amount: ticket.amount });
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
  generateReport: t.procedure.input(z.date()).mutation(async ({ ctx, input }) => {
    const inputDate = input ?? new Date(new Date().setDate(new Date().getDate() - 7));
    const users = (await ctx.prisma.user.findMany()).filter(
      (user) => env.NEXT_PUBLIC_TEST_MODE === "true" || user.isEmployee
    );
    const reports: Report = [];
    const balancesCaller = balancesRouter.createCaller(ctx);
    const ticketCaller = ticketsRouter.createCaller(ctx);
    const movementsCaller = movementsRouter.createCaller(ctx);
    const usersCaller = usersRouter.createCaller(ctx);

    const tickets = await ticketCaller.getAllByDate(inputDate);
    const movements = await movementsCaller.getAllByDate(inputDate);

    const costCenterBalances = await balancesCaller.getCostCenterBalances(inputDate);

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
          cashOut: ticket.amount * -1,
          costCenter: parsePrismaJson(ticket.costCenter),
          cashIn: 0,
        });
      }
    });

    for (const movement of movements) {
      const affectedReports = reports.filter((r) => {
        return r.userId === movement.fromUser || r.userId === movement.toUser;
      });

      const toUserName = (await usersCaller.getById(movement.toUser))?.name;
      const fromUserName = (await usersCaller.getById(movement.fromUser))?.name;

      affectedReports.forEach((report) => {
        if (report.userId === movement.fromUser) {
          report.movements.push({
            ...movement,
            invoiceDate: movement.date,
            costCenter: toUserName ?? "",
            cashOut: movement.amount * -1,
            cashIn: 0,
          });
        } else {
          report.movements.push({
            ...movement,
            invoiceDate: movement.date,
            cashOut: 0,
            cashIn: movement.amount,
            costCenter: fromUserName ?? "",
          });
        }
      });
    }

    const workbook = new ExcelJS.Workbook();

    reports?.forEach((report) => {
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
    costCenterSheet.addRows(costCenterBalances ?? []);

    await workbook.xlsx.writeFile("/tmp/report.xlsx");

    const stream = readFileSync("/tmp/report.xlsx");

    return { report: stream.toString("base64") };
  }),
  generateAfipReport: t.procedure.input(z.date()).mutation(async ({ ctx, input }) => {
    const ticketCaller = ticketsRouter.createCaller(ctx);
    const allTickets = await ticketCaller.getAllAfip();

    const tickets = allTickets.filter((ticket) => isSameYear(ticket.invoiceDate, input));
    const allReports = groupBy(tickets, ["userName", "isEmployee"], "report");
    const rawReports = allReports.filter(({ report, isEmployee }) => report.length > 0 && isEmployee);
    const reports = rawReports.map(({ userName, report }) => ({
      userName,
      report: report.map((ticket) => ({
        ...ticket,
        netoGravado: 0,
        netoNoGravado: 0,
        operacionesExentas: 0,
        iva21: 0,
        iva105: 0,
        percepcionesIva: 0,
        percepcionesIIBBCABA: 0,
        percepcionesIIBBBSAS: 0,
        impuestosInternos: 0,
      })),
    }));
    const workbook = new ExcelJS.Workbook();

    reports?.forEach(({ userName, report }) => {
      const sheet = workbook.addWorksheet(userName);
      sheet.columns = sheetAfipColumns;

      sheet.getRow(1).height = 20;
      sheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF00" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      sheet.addRows(report);

      const totalColumnIndex = sheetAfipColumns.findIndex((col) => col.key === "total");

      report.forEach((ticket, i) => {
        const totalFormula = `SUM(I${i + 2}:Q${i + 2})`;
        sheet.getCell(`${String.fromCharCode(65 + totalColumnIndex)}${i + 2}`).value = {
          formula: totalFormula,
          date1904: false,
        };
      });
    });

    await workbook.xlsx.writeFile("/tmp/report.xlsx");

    const stream = readFileSync("/tmp/report.xlsx");

    return { report: stream.toString("base64") };
  }),
});
