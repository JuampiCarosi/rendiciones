import Button from "./Button";
import { FaFileInvoice } from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";

type BottomParams = {
  handleShowTicketModal: (value: boolean) => void;
  handleShowEntryModal: (value: boolean) => void;
};

const Bottom = ({ handleShowTicketModal, handleShowEntryModal }: BottomParams) => {
  return (
    <div className="flex justify-around bg-background py-8">
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
