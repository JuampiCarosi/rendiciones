import { getNextWednesday, parsePettyCashDate } from "../../../utils/helpers";
import { t } from "../trpc";

export const pettyCashRouter = t.router({
  getDates: t.procedure.query(async ({ ctx }) => {
    const currentPettyCashDate = getNextWednesday(new Date());
    const ticketPettyCashDates = await ctx.prisma.ticket.findMany({
      orderBy: {
        pettyCashDate: "desc",
      },
      distinct: ["pettyCashDate"],
    });
    const movementPettyCashDates = await ctx.prisma.movements.findMany({
      orderBy: {
        pettyCashDate: "desc",
      },
      distinct: ["pettyCashDate"],
    });

    const pettyCashDates: Array<{ date: Date; label: string }> = [];

    ticketPettyCashDates.forEach((ticket) => {
      pettyCashDates.push(parsePettyCashDate(ticket.pettyCashDate));
    });
    movementPettyCashDates.forEach((movement) => {
      if (!pettyCashDates.find((pettyCash) => pettyCash.date.getTime() === movement.pettyCashDate.getTime()))
        pettyCashDates.push(parsePettyCashDate(movement.pettyCashDate));
    });

    if (!pettyCashDates?.some((item) => item.date.getTime() === currentPettyCashDate.getTime())) {
      pettyCashDates.unshift(parsePettyCashDate(currentPettyCashDate));
    }
    // if (pettyCashDates.length > 10) {
    //   return pettyCashDates.slice(0, 7);
    // }
    return pettyCashDates;
  }),
});
