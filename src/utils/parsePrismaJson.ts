import { Prisma } from "@prisma/client";

export const parsePrismaJson = <
  T = string | number | boolean | Record<string, unknown> | Array<unknown> | null
>(
  json: Prisma.JsonValue
): T => {
  if (Array.isArray(json)) return json as unknown as T;
  if (json === "") return [] as unknown as T;
  return JSON.parse(json as string) as T;
};
