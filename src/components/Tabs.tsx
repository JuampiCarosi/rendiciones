import React from "react";

type TabsProps = {
  selectedTable: "tickets" | "movements";
  toggleTable: () => void;
};

const Tabs = ({ selectedTable, toggleTable }: TabsProps) => {
  return (
    <div className="flex justify-around">
      <button
        className={`rounded-tl-lg rounded-tr-lg bg-slate-${
          selectedTable === "tickets" ? 300 : 200
        } px-2 pt-1`}
        onClick={toggleTable}
      >
        Tickets
      </button>
      <button
        className={`rounded-tl-lg rounded-tr-lg bg-slate-${
          selectedTable === "movements" ? 300 : 200
        } px-2 pt-1`}
        onClick={toggleTable}
      >
        Movimientos
      </button>
    </div>
  );
};

export default Tabs;
