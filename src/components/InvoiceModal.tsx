import Input, { SelectInput } from "./Input";
import { useForm } from "react-hook-form";
import { Fragment } from "react";
import { trpc } from "../utils/trpc";
import { Dialog, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const ticketParamsVal = z.object({
  amount: z.number().min(1),
  description: z.string().min(1),
  invoiceDate: z.date(),
  expenseType: z.string().min(1),
  invoiceType: z.string().min(1),
  costCenter: z.string().min(1),
});

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

const errorMessages = {
  invoiceType: "tipo de factura",
  description: "descripción",
  amount: "monto",
  invoiceDate: "fecha del ticket",
  costCenter: "centro de costos",
  expenseType: "tipo de gasto",
};

type ErrorMessageKeys = keyof typeof errorMessages;

type Props = {
  handleShow: (show: boolean) => void;
  show: boolean;
};

const InvoiceModal = ({ handleShow, show }: Props) => {
  const {
    register,
    handleSubmit: handleSubmitVal,
    formState,
  } = useForm({
    resolver: zodResolver(ticketParamsVal),
  });
  const { data: session } = useSession();
  const userName = session?.user?.email?.split("@")[0] || "";

  const mutation = trpc.proxy.tickets.createTicket.useMutation();

  const onSubmit = handleSubmitVal((props) => {
    const { amount, description, invoiceDate, invoiceType, expenseType, costCenter } = props;
    mutation.mutate({
      amount: Number(amount),
      description,
      invoiceDate: new Date(invoiceDate),
      userName,
      invoiceType,
      expenseType,
      costCenter,
    });
  });

  const errorMessageKeys = Object.keys(formState.errors) as ErrorMessageKeys[];
  const clientErrorMessageArray = errorMessageKeys.map((key) => {
    return `El campo  ${errorMessages[key]} es requerido`;
  });
  const errorMessage = clientErrorMessageArray.join("\n") || mutation.error?.shape?.customErrorMessage;

  return (
    <>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        show={show}
        as={Fragment}
      >
        <Dialog onClose={() => handleShow(false)} className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="fixed inset-0 z-20 bg-black/50"></div>
            </div>

            <Dialog.Panel
              className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] overflow-hidden rounded-lg bg-white px-5 py-6 shadow-xl transition-all focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle md:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className=" mb-4">
                <Dialog.Title className="text-md font-medium leading-6 text-gray-900">
                  Nuevo movimiento de caja
                </Dialog.Title>
                {errorMessage && (
                  <div className="text-red-500" style={{ whiteSpace: "pre" }}>
                    {errorMessage}
                  </div>
                )}
              </div>

              <form onSubmit={onSubmit} className="grid gap-2">
                <SelectInput
                  label="Tipo de Factura"
                  data={invoiceTypes}
                  name="invoiceType"
                  register={register}
                  required
                />

                <Input register={register} required label="Descripcion" name="description" />
                <Input register={register} required label="Monto" type="number" name="amount" />
                <Input register={register} required label="Fecha del ticket" type="date" name="invoiceDate" />

                <SelectInput
                  label="Centro de costos"
                  data={costCenterTypes}
                  name="costCenter"
                  register={register}
                  required
                />

                <SelectInput
                  label="Tipo de gasto"
                  data={expenseTypes}
                  name="expenseType"
                  register={register}
                  required
                />

                <div className="flex gap-2 pt-4 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleShow(false)}
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
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default InvoiceModal;
