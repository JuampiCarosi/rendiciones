import { Ticket } from "@prisma/client";
import React from "react";

type TicketCardProps = {
  ticket: Ticket;
  isMovement?: boolean;
};

const formatoPesos = new Intl.NumberFormat("es-AR");

const TicketCard = ({ ticket }: TicketCardProps) => {
  return (
    <div className=" p-2">
      <div className=" flex flex-col items-start rounded-lg border	border-gray-300 p-4	text-center">
        <div className=" w-full overflow-hidden text-ellipsis whitespace-nowrap	pb-1 text-lg font-semibold">
          <span>{ticket.description}</span>
        </div>
        <div className="grid w-full	 grid-cols-2">
          <span className="w-fit rounded-full bg-red-200 px-2 py-1 text-sm font-bold text-red-800 ">
            {ticket.expenseType}
          </span>
          <div className="flex  justify-between">
            <span>{`Fact. ${ticket.invoiceType}`}</span>
            <span>$ {formatoPesos.format(ticket.amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
