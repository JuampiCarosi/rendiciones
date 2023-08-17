import type { NamedExoticComponent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TableRowProps } from "../components/Table";
import { DataTable, DataTableCellProps, DataTableColumnProps } from "../components/DataTable";
import { cn } from "./cn";

type GenericObject = Record<string, unknown>;

export const useTable = <
  TRow extends GenericObject,
  TFilters extends { [k: string]: { value: string; filterFunc: (row: TRow, filter: string) => boolean } }
>(props: {
  rows: TRow[] | undefined;
  rowVariant?: { [k in NonNullable<TableRowProps["variant"]>]?: (row: TRow) => boolean };
  rowVariantFilter?: {
    [k in NonNullable<TableRowProps["variant"]>]?: boolean;
  };
  filters?: TFilters;
}) => {
  const filteredRows = useMemo(
    () =>
      (props.rows || [])
        .map((row) => {
          const variant = (Object.entries(props.rowVariant ?? {}).find(([, fn]) => fn(row))?.[0] ??
            "none") as NonNullable<TableRowProps["variant"]>;
          return {
            row,
            variant,
          };
        })
        .filter(({ row, variant }) => {
          return Object.values(props.filters ?? {}).every((filter) => {
            const filterable = variant === "none" ? true : props.rowVariantFilter?.[variant];
            return filterable && typeof filterable !== "undefined"
              ? filter.filterFunc(row, filter.value)
              : true;
          });
        }),
    [props.filters, props.rowVariant, props.rowVariantFilter, props.rows]
  );

  const col = useCallback(<T extends keyof TRow>(accessor: T) => {
    return accessor;
  }, []);

  const _DataTable = useMemo(() => {
    return {
      ...DataTable,
      Column: DataTable.Column as NamedExoticComponent<
        Omit<DataTableColumnProps, "accessor" | "accessorAlias"> &
          ({ accessor: keyof TRow } | { accessorAlias: string })
      >,
      Cell: DataTable.Cell as NamedExoticComponent<
        Omit<DataTableCellProps, "accessor" | "accessorAlias"> &
          ({ accessor: keyof TRow } | { accessorAlias: string })
      >,
    };
  }, []);

  return useMemo(
    () => ({
      rows: filteredRows,
      col,
      DataTable: _DataTable,
    }),
    [filteredRows, col, _DataTable]
  );
};
type Brand<K, T> = K & { __brand: T };

export type Visibility = Brand<Record<string, string>, "visibility">;

export function useVisibility<T extends string>(
  id: string,
  columns: T[],
  visibility: { [k in T]?: { [k in "base" | "full" | "lg" | "md" | "xl" | "sm"]?: boolean } }
) {
  id;

  const [_visibility, _setVisibility] = useState(visibility);
  const [mediaQuery, setMediaQuery] = useState<"sm" | "md" | "lg" | "xl" | "full" | null>(null);

  useEffect(() => {
    if (!window) return;

    const handler = () => {
      setMediaQuery(
        window.innerWidth < 640
          ? "sm"
          : window.innerWidth < 768
          ? "md"
          : window.innerWidth < 1024
          ? "lg"
          : window.innerWidth < 1280
          ? "xl"
          : "full"
      );
    };

    window.addEventListener("resize", handler);
    handler();

    return () => window.removeEventListener("resize", handler);
  }, []);

  const visibilityCn = useMemo(() => {
    const visibilityClassNames = {} as Record<string, string>;

    Object.entries(_visibility).forEach(([key, value]) => {
      const { sm, md, lg, full, base, xl } = value as {
        [k in "base" | "full" | "lg" | "md" | "sm" | "xl"]?: boolean;
      };

      const classNames = cn({
        hidden: base !== undefined && !base,
        "table-cell": base,
        "max-sm:hidden": sm !== undefined && !sm,
        "max-sm:table-cell": sm,
        "max-md:hidden": md !== undefined && !md,
        "max-md:table-cell": md,
        "max-lg:hidden": lg !== undefined && !lg,
        "max-lg:table-cell": lg,
        "max-xl:hidden": xl !== undefined && !xl,
        "max-xl:table-cell": xl,
        "xl:hidden": full !== undefined && !full,
        "xl:table-cell": full,
      });

      visibilityClassNames[key] = classNames;
    });
    return visibilityClassNames as Brand<Record<keyof typeof visibility, string>, "visibility">;
  }, [_visibility]);

  const setVisibility = useCallback(
    (accessor: T, value: boolean) => {
      _setVisibility((prev) => {
        return {
          ...prev,
          [accessor]: {
            ...prev[accessor],
            [mediaQuery ?? "base"]: value,
          },
        };
      });
    },
    [mediaQuery]
  );

  const getVisibility = useCallback(
    (accessor: T) => {
      return _visibility?.[accessor]?.[mediaQuery ?? "base"] ?? true;
    },
    [_visibility, mediaQuery]
  );

  const numOfColumns = useMemo(
    () => columns.filter((v) => _visibility[v]?.[mediaQuery ?? "base"] ?? true).length,
    [_visibility, columns, mediaQuery]
  );

  return { visibilityCn, setVisibility, getVisibility, numOfColumns };
}
