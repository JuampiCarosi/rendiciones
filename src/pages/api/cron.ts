import { NextApiRequest, NextApiResponse } from "next";
import ExcelJS from "exceljs";
import { Report } from "../../shared/types";
import { getNextWednesday, parsePettyCashDate } from "../../utils/helpers";
import { authenticateGoogle } from "../../utils/googleAuth";
import { google } from "googleapis";
import fs from "fs";
import { env } from "../../env/server.mjs";

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      if (authorization === `Bearer ${env.API_SECRET_KEY}`) {
        console.log("Cron job started, generating report");

        const date = new Date();

        console.log(
          "report url",
          `${env.NEXTAUTH_URL}/api/trpc/balances.generateReport?input=${encodeURIComponent(
            JSON.stringify(getNextWednesday(date))
          )}`
        );

        const reportResult = await fetch(
          `${env.NEXTAUTH_URL}/api/trpc/balances.generateReport?input=${encodeURIComponent(
            JSON.stringify(getNextWednesday(date))
          )}`
        );

        const { result: reportData } = await reportResult.json();
        const reports = reportData.data.json as Report;

        const costCenterBalanceResult = await fetch(
          `${env.NEXTAUTH_URL}/api/trpc/balances.getCostCenterBalances`
        );
        const { result: costCenterData } = await costCenterBalanceResult.json();
        const costCenterBalance = costCenterData.data.json;

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
        costCenterSheet.addRows(costCenterBalance ?? []);

        await workbook.xlsx.writeFile("/tmp/report.xlsx");

        const fileMetadata = {
          name: `Reporte ${parsePettyCashDate(date).label}.xlsx`,
          driveId: "0AJ-feM-xgnh_Uk9PVA",
          parents: ["1xoNNmBcGg4YdVjAjaZgu7zVpfEVRwg5b"],
        };

        const media = {
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          body: fs.createReadStream("/tmp/report.xlsx"),
        };

        const auth = authenticateGoogle();
        const driveService = google.drive({ version: "v3", auth });

        await driveService.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: "id",
          supportsAllDrives: true,
        });

        console.log("Cron job finished, report generated ");

        res.status(200).json({ success: true });
      } else {
        res.status(403).json({ statusCode: 403, message: "Forbidden access" });
      }
    } catch (err: any) {
      console.log(err);
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
