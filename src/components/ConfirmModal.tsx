import { Transition } from "@headlessui/react";
import { Fragment } from "react";
import Button from "./Button";

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
        <div onClick={() => handleShow(false)} className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center sm:block sm:p-0">
            <div className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] overflow-hidden rounded-lg bg-white px-5 py-6 shadow-xl transition-all focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle md:w-full">
              <h2 className="text-md font-medium leading-6 text-gray-900">{title}</h2>
              <span className="leading-6 text-gray-700">{message}</span>
              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button label="Confirmar" className=" w-full" onClick={() => onConfirm()} />
                <Button
                  label="Cancelar"
                  className=" m-auto w-full bg-red-600"
                  onClick={() => handleShow(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
};

export default ConfirmModal;
