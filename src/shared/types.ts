import { Movements, Ticket } from "@prisma/client";
import { z } from "zod";

export const ticketParamsVal = z.object({
  amount: z.number().min(1),
  description: z.string().min(1),
  invoiceDate: z.date(),
  expenseType: z.string().min(1),
  invoiceType: z.string().min(1),
  costCenter: z.string().min(1).optional(),
});

export const movementsParamsVal = z.object({
  amount: z.number().min(1),
  description: z.string().min(1),
  fromUser: z.string().min(1),
  toUser: z.string().min(1),
  date: z.date(),
  isFromBank: z.boolean().default(false),
});
export type expenseTypes = "combustible" | "viaticos" | "peajes" | "otros";

export const costCenterTypes = [
  "GRA",
  "GSP",
  "PICC",
  "BOAT",
  "MIGUE",
  "AGPA",
  "LEON",
  "CAMP",
  "INCHU",
] as const;

type ExcelTicket = Omit<Ticket, " amount"> & { cashOut: number; cashIn: number };
type ExcelMovement = Omit<Movements, "amount"> & {
  cashOut: number;
  cashIn: number;
  invoiceDate: Date;
  costCenter: string;
};

export type Report = Array<{
  userId: string;
  name?: string;
  pettyCash: string;
  tickets: ExcelTicket[];
  balance: number;
  movements: ExcelMovement[];
  prevBalance: number;
}>;
