import { getNextWednesday, parsePettyCashDate } from "../utils/helpers";
import { trpc } from "../utils/trpc";
import ExcelJS from "exceljs";

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

export const useReport = (date: Date) => {
  const { data: reports, isLoading: isReportLoading } = trpc.balances.generateReport.useQuery(
    getNextWednesday(date)
  );
  const { data: costCenterBalance, isLoading: isBalancesLoading } =
    trpc.balances.getCostCenterBalances.useQuery(getNextWednesday(date));

  console.log(reports);

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

  const downloadReport = () =>
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${parsePettyCashDate(date).label}.xlsx`;
      a.click();
    });

  return { downloadReport, isLoading: isReportLoading || isBalancesLoading };
};
