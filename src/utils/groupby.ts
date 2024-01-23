import { isDate, isSameDay } from "date-fns";

// eslint-disable-next-line @typescript-eslint/ban-types
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

type Grouped<
  TRecords extends Record<string, unknown>,
  TKeys extends keyof TRecords,
  TgroupName extends string = "data"
> = Prettify<Pick<TRecords, TKeys> & Record<TgroupName, Array<Omit<TRecords, TKeys>>>>;

export function groupBy<
  TRecords extends Record<string, unknown>[],
  TKeys extends Array<keyof TRecords[number]>,
  TGroupName extends string
>(records: TRecords, keys: TKeys, groupName: TGroupName) {
  const groups: Grouped<TRecords[number], typeof keys[number], typeof groupName>[] = [];

  records.forEach((row: TRecords[number]) => {
    const group = groups.find((g) =>
      keys.every((key) => {
        const groupKey = g[key];
        const rowKey = row[key];

        if (isDate(groupKey) && groupKey instanceof Date) {
          if (rowKey instanceof Date) {
            return isSameDay(groupKey, rowKey);
          } else return false;
        }

        return groupKey === rowKey;
      })
    );
    if (!group) {
      const group = Object.fromEntries(
        Object.entries(row).filter(([key]) => keys.includes(key))
      ) as typeof groups[number];
      group[groupName] = [] as never;
      group[groupName].push(
        Object.fromEntries(Object.entries(row).filter(([key]) => !keys.includes(key))) as never
      );
      groups.push(group as never);
    }
    group?.[groupName].push(
      Object.fromEntries(Object.entries(row).filter(([key]) => !keys.includes(key))) as never
    );
  });

  return groups;
}
