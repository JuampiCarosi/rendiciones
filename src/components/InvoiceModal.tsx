import Input from "./Input";
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

const InvoiceModal = () => {
  const { register, handleSubmit } = useForm();
  const [invoiceType, setInvoiceType] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [inputError, setInputError] = useState("");

  const onSubmit = handleSubmit((data) => {
    const { pettyCash, amount, description, invoiceDate, userName } = data as TicketParams;
    const pettyCashSplitted = data.pettyCash.split("/");
    if (pettyCashSplitted.length !== 2 || pettyCashSplitted[0] > 31 || pettyCashSplitted[1] > 12) {
      setInputError("El formato de la caja chica es incorrecto, debe ser 'dd/mm'");
      return;
    }
    // setInputError("");
    trpc.proxy.tickets.createTicket.useQuery({
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

  return (
    <div>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div
            className="inline-block w-80 align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                Nuevo movimiento de caja
              </h3>
              {inputError && <p className="text-red-600 pt-3">{inputError}</p>}
            </div>
            <form onSubmit={onSubmit}>
              <div className="p-2 ">
                <label>Tipo de factura</label>
                <Select options={invoiceTypes} onChange={(e) => setInvoiceType(e?.value || "")} />
              </div>
              <Input register={register} label="Descripcion" name="description" />
              <Input register={register} label="Monto" type="number" name="amount" />
              <Input register={register} label="Fecha" type="date" name="date" />
              <div className="p-2">
                <label>Centro de costos</label>
                <Select options={costCenterTypes} onChange={(e) => setCostCenter(e?.value || "")} />
              </div>
              <div className="p-2">
                <label>Tipo de gasto</label>
                <Select options={expenseTypes} onChange={(e) => setExpenseType(e?.value || "")} />
              </div>
              <Input register={register} label="Caja chica del" placeholder="dd/mm" name="pettyCash" />

              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <input
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2  text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
