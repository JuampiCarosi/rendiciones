import Button from "./Button";
import { FaFileInvoice } from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";

type BottomParams = {
  handleShowTicketModal: (value: boolean) => void;
  handleShowEntryModal: (value: boolean) => void;
};

const Bottom = ({ handleShowTicketModal, handleShowEntryModal }: BottomParams) => {
  return (
    <div className="fixed bottom-0 flex w-full justify-around bg-background pb-8 pt-4">
      <Button label="Nuevo ticket" onClick={() => handleShowTicketModal(true)} Icon={FaFileInvoice} />
      <Button
        label="Nuevo moviemiento de caja"
        onClick={() => handleShowEntryModal(true)}
        Icon={TbReportMoney}
      />
    </div>
  );
};

export default Bottom;
