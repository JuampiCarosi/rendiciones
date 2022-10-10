import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

type Props = {
  handleShow: (show: boolean) => void;
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
};

const ConfirmModal = ({ show, handleShow, title, message, onConfirm }: Props) => {
  return (
    <>
      {show && <div className="fixed inset-0 z-40 bg-black/30 transition-opacity" aria-hidden="true"></div>}
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
        <Dialog className="fixed inset-0 z-50 overflow-y-auto" onClose={() => handleShow(false)}>
          <div className="flex min-h-screen items-center justify-center sm:block sm:p-0">
            <div className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] overflow-hidden rounded-lg bg-white px-5 py-6 shadow-xl transition-all focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle md:w-full">
              <h2 className="text-md mb-2 font-medium leading-6 text-gray-900">{title}</h2>
              <span className="leading-6 text-gray-700">{message}</span>

              <div className="flex gap-2 pt-4 sm:justify-end">
                <button
                  type="button"
                  onClick={() => handleShow(false)}
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-base  font-medium text-gray-500  shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm()}
                  className="inline-flex w-full justify-center rounded-md border border-red-700 bg-red-600 px-4 py-2 text-base  font-medium text-white  shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ConfirmModal;
