import { Prisma } from "@prisma/client";

export const parsePrismaJson = <
  T = string | number | boolean | Record<string, unknown> | Array<unknown> | null
>(
  json: Prisma.JsonValue
): T => {
  return JSON.parse(json as string) as T;
};
