import { Movements, Ticket } from "@prisma/client";
import { useEffect, useState } from "react";
import MovementCard from "./Movement/Card";

import TicketCard from "./Ticket/Card";
import EditTicketModal from "./Ticket/EditModal";

type CarouselProps = {
  currentPettyCash: Date;
  tickets: Ticket[] | undefined;
  movements: Movements[] | undefined;
};

const Carousel = ({ currentPettyCash, tickets, movements }: CarouselProps) => {
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);

  const handleShowEditTicketModal = (value: boolean) => {
    setShowEditTicketModal(value);
    if (!value) setCurrentTicket(null);
  };

  const handleEditTicket = (ticketId: string) => {
    setCurrentTicket(ticketId);
  };

  useEffect(() => {
    setShowEditTicketModal(currentTicket !== null);
  }, [currentTicket]);

  return (
    <div className="m-auto max-w-lg">
      {currentTicket && (
        <EditTicketModal
          show={showEditTicketModal}
          handleShow={handleShowEditTicketModal}
          currentPettyCashDate={currentPettyCash}
          ticketId={currentTicket}
          tickets={tickets}
        />
      )}
      <div className="h-12"></div>
      {tickets?.length === 0 && movements?.length === 0 && (
        <div className="flex justify-center py-3">
          <h3 className=" text-slate-400">No hay movimientos en esta caja</h3>
        </div>
      )}
      {tickets &&
        tickets.map((ticket, i) => (
          <TicketCard key={i} ticket={ticket} onClick={() => handleEditTicket(ticket.id)} />
        ))}
      {movements && movements.map((movement, i) => <MovementCard key={i} movement={movement} />)}
    </div>
  );
};

export default Carousel;
