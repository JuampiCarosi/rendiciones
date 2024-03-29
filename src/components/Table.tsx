import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { format, isValid } from "date-fns";
import type { HTMLProps, MouseEventHandler, ReactNode } from "react";
import { memo } from "react";
import { createContext, useContext } from "react";
import { cn } from "../utils/cn";
import { formatNumber } from "../utils/formatNumber";

type TableContextType = {
  condensed?: boolean;
  rounded?: "all" | "perimeter" | "none";
};
const TableContext = createContext<TableContextType | null>(null);
const useTableContext = () => useContext(TableContext) as TableContextType;

export type TableProps = {
  tableProps?: HTMLProps<HTMLTableElement>;
  children?: ReactNode;
  className?: string;
} & TableContextType;

export function Table({ children, className, rounded, condensed, tableProps }: TableProps) {
  const ctx = useTableContext();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: ` table tr.variant + tr > td {
                        border-top: 0;
                    }`,
        }}
      ></style>
      <TableContext.Provider
        value={{
          condensed: condensed ?? ctx?.condensed ?? false,
          rounded: rounded ?? ctx?.rounded ?? "perimeter",
        }}
      >
        <div
          className={cn("overflow-auto", {
            "sm:rounded-md": (rounded ?? ctx?.rounded) !== "none",
          })}
        >
          <table
            className={cn("table w-full border-separate border-spacing-0 bg-white", className)}
            {...tableProps}
          >
            {children}
          </table>
        </div>
      </TableContext.Provider>
    </>
  );
}

type TableHeadProps = { children?: ReactNode } & TableContextType;

const TableHead = memo(function TableHead({ children, condensed, rounded }: TableHeadProps) {
  const ctx = useTableContext();
  return (
    <TableContext.Provider value={{ condensed: condensed ?? ctx.condensed, rounded: rounded ?? ctx.rounded }}>
      <thead>
        <tr className="overflow-hidden">{children}</tr>
      </thead>
    </TableContext.Provider>
  );
});

const columnVariants = cva(
  "whitespace-nowrap border-b border-t border-slate-150 bg-slate-50 px-2.5 py-1 font-medium text-slate-600",
  {
    variants: {
      rounded: {
        all: "sm:first-of-type:rounded-l-md sm:first-of-type:border-l sm:last-of-type:rounded-r-md sm:last-of-type:border-r",
        perimeter:
          "sm:first-of-type:rounded-tl-md sm:first-of-type:border-l sm:last-of-type:rounded-tr-md sm:last-of-type:border-r",
        none: "",
      },
      isNumber: {
        true: "text-right",
        false: "",
      },
      isDate: {
        true: "text-center",
      },
      align: {
        left: "text-left",
        center: "text-center",
        "center!": "text-center",
        right: "text-right",
        "right!": "text-right",
      },
    },
    compoundVariants: [],
    defaultVariants: {
      rounded: "perimeter",
      isNumber: false,
      isDate: false,
      align: "left",
    },
  }
);
export type TableColumnProps = TableContextType &
  VariantProps<typeof columnVariants> & {
    children?: ReactNode;
    order?: "desc" | "asc" | "none";
    className?: string;
    thProps?: Omit<HTMLProps<HTMLTableCellElement>, "className">;
  };
const TableColumn = memo(function TableColumn({
  children,
  thProps,
  align,
  className,
  isDate,
  isNumber,
  rounded,
  ...rest
}: TableColumnProps) {
  const ctx = useTableContext();

  const variants = {
    rounded: rounded ?? ctx.rounded,
    isNumber: isNumber ?? false,
    isDate: isDate ?? false,
    align: align ?? "left",
  };

  return (
    <th className={columnVariants({ ...variants, className })} {...rest} {...thProps}>
      {children}
    </th>
  );
});

type TableBodyProps = TableHeadProps;
const TableBody = memo(function TableBody({ children, condensed, rounded }: TableBodyProps) {
  const ctx = useTableContext();

  return (
    <TableContext.Provider value={{ condensed: condensed ?? ctx.condensed, rounded: rounded ?? ctx.rounded }}>
      <tbody>{children}</tbody>
    </TableContext.Provider>
  );
});

const rowVariants = cva("group", {
  variants: {
    variant: {
      main: "hover:bg-slate-50",
      secondary: "hover:bg-slate-50",
      gray: "hover:bg-slate-50",
      light: "hover:bg-slate-50",
      dark: "hover:bg-slate-50",
      none: "hover:bg-slate-300/20",
    },
    clickable: {
      true: "cursor-pointer",
    },
  },
});

export type TableRowProps = {
  trProps?: Omit<HTMLProps<HTMLTableRowElement>, "className" | "children">;
  children: ReactNode;
  className?: string;
  borderless?: boolean;
  onClick?: MouseEventHandler<HTMLTableRowElement>;
} & VariantProps<typeof rowVariants> &
  TableContextType;

type TableRowContextType = {
  variant?: VariantProps<typeof rowVariants>["variant"];
};
const TableRowContext = createContext<TableRowContextType | null>(null);
const useTableRowContext = () => useContext(TableRowContext) as TableRowContextType;

const TableRow = memo(function TableRow({
  children,
  className,
  variant,
  condensed,
  rounded,
  borderless,
  onClick,
  trProps,
}: TableRowProps) {
  const ctx = useTableContext();

  return (
    <TableRowContext.Provider
      value={{
        variant: variant,
      }}
    >
      <TableContext.Provider
        value={{ condensed: condensed ?? ctx.condensed, rounded: rounded ?? ctx.rounded }}
      >
        <tr
          className={cn(
            { variant: (variant ?? "none") !== "none", borderless: borderless },
            rowVariants({ variant, clickable: Boolean(onClick) }),
            className
          )}
          {...trProps}
          onClick={onClick}
        >
          {children}
        </tr>
      </TableContext.Provider>
    </TableRowContext.Provider>
  );
});

const cellVariants = cva(
  [
    "whitespace-nowrap border-slate-150 px-2.5 text-left text-[13px] text-slate-500",
    "border-t group-first:border-t-0 group-[.borderless]:border-t-0",
  ],
  {
    variants: {
      tabular: {
        true: "text-right  tabular-nums tracking-tight ",
      },
      truncate: {
        true: "overflow-hidden text-ellipsis whitespace-nowrap",
        false: "",
      },
      align: {
        center: "text-center  first-of-type:text-left",
        "center!": "text-center",
        right: "text-right first-of-type:text-left",
        "right!": "text-right",
        left: "text-left",
      },
      variant: {
        main: "border-0 bg-sky-700/90 font-semibold text-white",
        secondary: "border-0 bg-sky-400/70 font-semibold text-white",
        gray: "border-0 bg-gray-200 font-semibold text-gray-700",
        light: "border-0 bg-gray-100 font-semibold text-gray-700",
        dark: "border-0 bg-gray-800 font-semibold text-white",
        none: "",
      },
      rounded: {
        all: "sm:first-of-type:rounded-l-md sm:last-of-type:rounded-r-md",
        perimeter:
          "sm:first-of-type:border-l sm:last-of-type:border-r " +
          "group-last:border-b group-last:sm:first-of-type:rounded-bl-md group-last:sm:last-of-type:rounded-br-md",
        none: "",
      },

      condensed: {
        true: "py-[1px]",
        false: "py-[3px]",
      },
    },
    compoundVariants: [
      { align: "center", variant: "none", className: "first-of-type:text-center" },
      { align: "right", variant: "none", className: "first-of-type:text-right" },

      {
        variant: "none",
        rounded: "all",
        className: "sm:first-of-type:rounded-tl-none sm:last-of-type:rounded-tr-none",
      },
    ],
    defaultVariants: {
      variant: "none",
      align: "left",
      truncate: false,
      condensed: false,
    },
  }
);

export type TableCellProps = {
  children?: ReactNode;
  className?: string;
  isNumber?: boolean;
  isDate?: boolean;
} & VariantProps<typeof cellVariants> &
  TableContextType &
  Omit<HTMLProps<HTMLTableCellElement>, "className" | "children">;
const TableCell = memo(function TableCell({
  children,
  className,
  condensed,
  tabular,
  isNumber,
  truncate,
  rounded,
  isDate,
  variant,
  align,
  ...rest
}: TableCellProps) {
  const ctx = useTableContext();
  const rowCtx = useTableRowContext();

  const variants = {
    ...rowCtx,
    align: align ?? (isDate ? "center" : isNumber ? "right" : null),
    condensed: condensed ?? ctx.condensed,
    tabular: tabular ?? (isNumber || isDate),
    rounded: rounded ?? ctx.rounded,
    truncate,
    variant: variant ?? rowCtx?.variant,
  };

  let value = children;
  if (typeof children === "number" && isNumber) {
    value = formatNumber(children);
  }

  const date = children;
  if (date instanceof Date && isDate && isValid(date)) {
    value = format(date, "dd-MM-yyyy");
  }

  return (
    <td className={cn(cellVariants(variants), className)} {...rest}>
      {value}
    </td>
  );
});

const containerVariants = cva("flex flex-col overflow-hidden pt-3 sm:mx-5", {
  variants: {
    variant: {
      card: "overflow-auto border-y border-slate-100 bg-white shadow shadow-slate-150 sm:rounded-lg sm:border-x sm:px-3 sm:py-4",
      island: "",
      narrow: "border-y border-slate-150 bg-white pb-0 shadow shadow-slate-150 sm:rounded-lg sm:border-x",
    },
  },
});
const containerToTableVariant = {
  card: "all",
  island: "perimeter",
  narrow: "none",
} as const;
type TableCardProps = {
  children: ReactNode;
  className?: string;
} & VariantProps<typeof containerVariants>;
export const TableContainer = ({ children, variant = "card", className }: TableCardProps) => {
  return (
    <TableContext.Provider value={{ condensed: false, rounded: containerToTableVariant[variant ?? "card"] }}>
      <div className={cn(containerVariants({ variant }), className)}>{children}</div>
    </TableContext.Provider>
  );
};

const TableContainerHeader = ({ children, className }: { children: ReactNode; className?: string }) => {
  const ctx = useTableContext();
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-2 pb-2.5 sm:px-0",
        { "sm:px-3": ctx.rounded === "none" },
        className
      )}
    >
      {children}
    </div>
  );
};

Table.Head = TableHead;
Table.Column = TableColumn;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

TableContainer.Header = TableContainerHeader;
