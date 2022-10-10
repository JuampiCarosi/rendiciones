import { Ticket } from "@prisma/client";
import React from "react";
import { expenseTypes } from "../../shared/types";

type TicketCardProps = {
  ticket: Ticket;
  onClick?: () => void;
};

const expenseTypeColors = {
  combustible: "bg-yellow-200 text-yellow-800",
  viaticos: "bg-blue-200 text-blue-800",
  peajes: "orange bg-orange-200 text-orange-800",
  otros: "grey bg-gray-200 text-gray-800",
};

const formatoPesos = new Intl.NumberFormat("es-AR");

const TicketCard = ({ ticket, onClick }: TicketCardProps) => {
  const expenseType = ticket.expenseType as expenseTypes;

  return (
    <div onClick={onClick} className=" p-2">
      <div className=" flex flex-col items-start gap-1 rounded-lg	border bg-gray-50 p-4 shadow-sm">
        <div className=" w-full overflow-hidden text-ellipsis whitespace-nowrap	pb-1 text-lg font-semibold">
          <span>{ticket.description}</span>
        </div>
        <div className="flex w-full	justify-between ">
          <span
            className={`w-fit rounded-full ${expenseTypeColors[expenseType]} px-2 py-1 text-sm font-bold `}
          >
            {ticket.expenseType}
          </span>
          <span>{`Fact. ${ticket.invoiceType.toUpperCase()}`}</span>
          <span>$ {formatoPesos.format(ticket.amount)}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
