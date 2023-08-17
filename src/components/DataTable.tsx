import {
  Table,
  type TableCellProps,
  type TableColumnProps,
  type TableProps,
  type TableRowProps,
} from "./Table";
import type { ReactNode } from "react";
import { createContext, memo, useContext } from "react";
import { cn } from "../utils/cn";

type Brand<K, T> = K & { __brand: T };
export type Visibility = Brand<Record<string, string>, "visibility">;

type DataTableContextType = {
  show?: Visibility;
};

const DataTableContext = createContext<DataTableContextType>({});
const useDataTableContext = () => useContext(DataTableContext);

type DataTableRootProps = TableProps & DataTableContextType;

const DataTableRoot = memo(function DataTableRoot(props: DataTableRootProps) {
  const { show, children, ...tableProps } = props;
  return (
    <DataTableContext.Provider value={{ show }}>
      <Table {...tableProps}>{children}</Table>
    </DataTableContext.Provider>
  );
});

export type DataTableColumnProps = TableColumnProps & {
  accessor?: string;
  accessorAlias?: string;
  label?: string;
  show?: string;
};
const DataTableColumn = memo(function DataTableColumn(props: DataTableColumnProps) {
  const { accessor, accessorAlias, className, label, show, ...tableColumnProps } = props;
  const { show: showCtx } = useDataTableContext();

  const showAccessor = accessor ?? accessorAlias;

  let newCN = "";

  if (show) newCN = show;
  else if (showCtx && showAccessor) newCN = showCtx[showAccessor] ?? "";

  return (
    <Table.Column className={cn(newCN, className)} {...tableColumnProps}>
      {label}
    </Table.Column>
  );
});

type DataTableRowContextType = {
  row: Record<string, unknown>;
};
const DataTableRowContext = createContext<DataTableRowContextType>({ row: {} });
const useDataTableRowContext = () => useContext(DataTableRowContext);

type DataTableRowProps = TableRowProps & DataTableRowContextType;
const DataTableRow = memo(function DataTableRow(props: DataTableRowProps) {
  const { row, ...tableRowProps } = props;
  return (
    <DataTableRowContext.Provider value={{ row }}>
      <Table.Row {...tableRowProps} />
    </DataTableRowContext.Provider>
  );
});

export type DataTableCellProps = TableCellProps & {
  accessor?: string;
  accessorAlias?: string;
  show?: string;
};

const DataTableCell = memo(function DataTableCell(props: DataTableCellProps) {
  const { accessor, accessorAlias, className, show, children, ...tableCellProps } = props;
  const { row } = useDataTableRowContext();
  const { show: showCtx } = useDataTableContext();

  const showAccessor = accessor ?? accessorAlias;

  let newCN = "";

  if (show) newCN = show;
  else if (showCtx && showAccessor) newCN = showCtx[showAccessor] ?? "";

  return (
    <Table.Cell className={cn(newCN, className)} {...tableCellProps}>
      {children ?? (row[showAccessor ?? ""] as ReactNode) ?? ""}
    </Table.Cell>
  );
});

export const DataTable = {
  Root: DataTableRoot,
  Head: Table.Head,
  Column: DataTableColumn,
  Body: Table.Body,
  Row: DataTableRow,
  Cell: DataTableCell,
};
