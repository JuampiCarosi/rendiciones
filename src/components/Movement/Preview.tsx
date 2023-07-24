import { Dialog, Transition } from "@headlessui/react";
import { trpc } from "../../utils/trpc";
import { Fragment } from "react";
import Input, { SelectInput } from "../Input";
import { z } from "zod";
import { formatNumber } from "../../utils/formatNumber";
import { useSession } from "next-auth/react";

type Props = {
  handleShow: (show: boolean) => void;
  show: boolean;
  movementId: string;
};

export const entryParamsVal = z.object({
  amount: z.number().min(1),
  description: z.string().min(1),
  fromUser: z.string().min(1),
  toUser: z.string().min(1),
});

const MovementPreview = ({ handleShow, show, movementId }: Props) => {
  const { data: session } = useSession();
  const { data } = trpc.movements.getById.useQuery(movementId);

  const users = trpc.users.getAll.useQuery();
  const usersData =
    users.data?.map((user) => {
      return { value: user.value || "", label: user.label || "" };
    }) || [];

  const allowedUsers = trpc.users.getAllowedTransfers.useQuery();
  const allowedUsersData =
    allowedUsers.data?.map((user) => {
      return { value: user.value || "", label: user.label || "" };
    }) || [];

  const handleClose = () => {
    handleShow(false);
  };

  const expenseType =
    data?.fromUser === session?.user?.id
      ? "Egreso"
      : data?.toUser === session?.user?.id
      ? "Ingreso"
      : "Caja central";
  const expenseColor =
    data?.fromUser === session?.user?.id
      ? "bg-red-200 text-red-800"
      : data?.toUser === session?.user?.id
      ? "bg-green-200 text-green-800"
      : "bg-purple-200 text-purple-800";

  return (
    <>
      {show && Boolean(data) && (
        <div className="fixed inset-0 z-20 bg-black/30 transition-opacity" aria-hidden="true"></div>
      )}
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        show={show && Boolean(data)}
        as={Fragment}
      >
        <Dialog onClose={() => handleShow(false)} className="fixed inset-0 z-30 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center sm:block sm:p-0">
            <Dialog.Panel
              className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] overflow-hidden rounded-lg bg-white px-5 py-6 shadow-xl transition-all focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle md:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className=" mb-4">
                <Dialog.Title className="flex justify-between">
                  <span className="text-md font-medium leading-6 text-gray-900"> Movimiento de Caja</span>
                  <span
                    className={`w-fit rounded-full ${expenseColor} px-2 py-1 text-sm font-bold ${expenseColor}`}
                  >
                    {expenseType}
                  </span>
                </Dialog.Title>
              </div>

              <SelectInput
                label="De usuario"
                data={allowedUsersData}
                value={data?.fromUser}
                name="fromUser"
                required
                disabled={true}
              />
              <SelectInput
                label="Para usuario"
                data={usersData}
                value={data?.toUser}
                name="toUser"
                required
                disabled={true}
              />
              <Input
                required
                label="Descripcion"
                name="description"
                value={data?.description}
                disabled={true}
              />
              <Input
                required
                label="Monto"
                name="amount"
                value={formatNumber(data?.amount)}
                disabled={true}
              />

              <div className="flex gap-2 pt-4 sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-base  font-medium text-gray-500  shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default MovementPreview;
