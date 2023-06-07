import { NextPage } from "next";

import Top from "../components/Top";
import { useState } from "react";
import { getNextWednesday } from "../utils/helpers";
import { FileLineChart, Store, UserSquare2 } from "lucide-react";

const Home: NextPage = () => {
  const [currentPettyCash, setCurrentPettyCash] = useState<Date>(getNextWednesday(new Date()));

  return (
    <div>
      <Top currentPettyCash={currentPettyCash} setPettyCash={setCurrentPettyCash} />

      <div className="mx-5 flex  flex-col gap-3 pt-20">
        <div className="flex  items-center  gap-3 border-b border-slate-400 pt-2 pb-4 text-slate-600">
          <FileLineChart />
          <h3 className=" text-xl ">Generar Reporte</h3>
        </div>
        <div className="flex  items-center  gap-3 border-b border-slate-400 pt-2 pb-4 text-slate-600">
          <Store />
          <h3 className=" text-xl ">Administrar Centro de Costos</h3>
        </div>
        <div className="flex  items-center  gap-3 border-b border-slate-400 pt-2 pb-4 text-slate-600">
          <UserSquare2 />
          <h3 className=" text-xl ">Administrar Usuarios</h3>
        </div>
      </div>
    </div>
  );
};

export default Home;
