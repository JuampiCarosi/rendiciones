import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import superjson from "superjson";

const errorMessages = {
  invoiceType: "tipo de factura",
  description: "descripción",
  amount: "monto",
  invoiceDate: "fecha del ticket",
  costCenter: "ventro de costos",
  expenseType: "tipo de gasto",
};

type Path = keyof typeof errorMessages;

export const t = initTRPC<{ ctx: Context }>()({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    let customErrorMessage = "";
    const errorJson = JSON.parse(error.message);
    if (errorJson[0].code === "too_small") {
      errorJson[0].path.forEach((path: Path) => {
        customErrorMessage += `El campo ${errorMessages[path]} es requerido\n`;
        console.log(customErrorMessage);
      });
    } else {
      customErrorMessage = "Hubo un error al subir el ticket";
    }

    return {
      ...shape,
      customErrorMessage,
    };
  },
});

export const authedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      // infers that `session` is non-nullable to downstream resolvers
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
