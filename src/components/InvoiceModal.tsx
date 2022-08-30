import Input, { SelectInput } from "./Input";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { TicketParams } from "../server/trpc/router/tickets";

const invoiceTypes = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
];

const expenseTypes = [
  { value: "combustible", label: "Combustible" },
  { value: "viaticos", label: "Viaticos" },
  { value: "peajes", label: "Peajes" },
  { value: "otros", label: "Otros" },
];

const costCenterTypes = [
  { value: "gra", label: "GRA" },
  { value: "gsp", label: "GSP" },
  { value: "picc", label: "PICC" },
];

type Props = {
  handleClose: () => void;
  handleSubmit: (data: any) => void;
  show: boolean;
};

const InvoiceModal = ({ handleClose, show, handleSubmit }: Props) => {
  const { register, handleSubmit: handleSubmitVal } = useForm();
  const [invoiceType, setInvoiceType] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [inputError, setInputError] = useState("");

  const mutation = trpc.proxy.tickets.createTicket.useMutation();

  const onSubmit = handleSubmitVal((data) => {
    const { pettyCash, amount, description, invoiceDate, userName } = data as TicketParams;
    const pettyCashSplitted = data.pettyCash.split("/");
    if (pettyCashSplitted.length !== 2 || pettyCashSplitted[0] > 31 || pettyCashSplitted[1] > 12) {
      setInputError("El formato de la caja chica es incorrecto, debe ser 'dd/mm'");
      return;
    }
    // setInputError("");
    mutation.mutate({
      pettyCash,
      amount,
      description,
      invoiceDate,
      userName,
      invoiceType,
      expenseType,
      costCenter,
    });
  });

  return show ? (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="fixed inset-0 z-20 bg-black/50"></div>
          </div>

          <div
            className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] overflow-hidden rounded-lg bg-white px-5 py-6 shadow-xl transition-all focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle md:w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <h3 className="text-md mb-4 font-medium leading-6 text-gray-900" id="modal-headline">
              Nuevo movimiento de caja
            </h3>
            {inputError && <p className="pt-3 text-red-600">{inputError}</p>}

            <form onSubmit={onSubmit} className="grid gap-2">
              <SelectInput
                label="Tipo de Factura"
                data={invoiceTypes}
                onChange={(e) => setInvoiceType(e?.value || "")}
              />

              <Input register={register} label="Descripcion" name="description" />
              <Input register={register} label="Monto" type="number" name="amount" />
              <Input register={register} label="Fecha" type="date" name="date" />

              <SelectInput
                label="Centro de costos"
                data={costCenterTypes}
                onChange={(e) => setCostCenter(e?.value || "")}
              />

              <SelectInput
                label="Tipo de gasto"
                data={expenseTypes}
                onChange={(e) => setExpenseType(e?.value || "")}
              />

              <Input register={register} label="Caja chica del" placeholder="dd/mm" name="pettyCash" />

              <div className="flex gap-2 pt-4 sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-base  font-medium text-gray-500  shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cerrar
                </button>
                <input
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2  text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  ) : null;
};

export default InvoiceModal;
