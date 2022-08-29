import MovementButton from "../components/MovementButton";
import { FaFileInvoice } from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";

const ActionsBar = () => {
  return (
    <div className="flex justify-around pt-4">
      <MovementButton label="Nuevo ingreso" Icon={TbReportMoney} />
      <MovementButton label="Nuevo egreso" Icon={FaFileInvoice} />
    </div>
  );
};

export default ActionsBar;
