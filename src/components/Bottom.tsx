import Button from "./Button";
import { FiPlus } from "react-icons/fi";
import { TbReportMoney } from "react-icons/tb";

type BottomParams = {
  handleShowTicketModal: (value: boolean) => void;
  handleShowEntryModal: (value: boolean) => void;
};

const Bottom = ({ handleShowTicketModal, handleShowEntryModal }: BottomParams) => {
  return (
    <div className="flex w-full justify-center  gap-8 border-t border-slate-300 bg-slate-200 pb-4">
      <button
        className="flex flex-col items-center border px-8 py-2 text-lg font-semibold  leading-5 text-slate-700"
        onClick={() => handleShowTicketModal(true)}
      >
        <span className="inline-block text-xs text-slate-500">Agregar</span>
        Ticket
      </button>
      <button
        className="flex flex-col items-center border px-8 py-2 text-lg font-semibold  leading-5 text-slate-700"
        onClick={() => handleShowEntryModal(true)}
      >
        <span className="inline-block text-xs text-slate-500">Agregar</span>
        Mov. de Caja
      </button>
    </div>
  );
};

export default Bottom;
