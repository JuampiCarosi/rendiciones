import { memo, useMemo, useState } from "react";
import { trpc } from "../utils/trpc";
import MovementCard from "./Movement/Card";

import TicketCard from "./Ticket/Card";
import EditTicketModal from "./Ticket/EditModal";

const Carousel = memo(function Carousel({ currentPettyCash }: { currentPettyCash: Date }) {
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);

  const { data: movements } = trpc.movements.getByDate.useQuery(currentPettyCash);
  const { data: tickets } = trpc.tickets.getByDate.useQuery(currentPettyCash);

  const handleTicketClick = (ticketId: string) => {
    setShowEditTicketModal(true);
    setCurrentTicket(ticketId);
  };

  const isAllowedToEdit = useMemo(() => {
    return !currentPettyCash || currentPettyCash >= new Date();
  }, [currentPettyCash]);

  return (
    <div className="m-auto max-w-lg">
      {/* {currentTicket && ( */}
      <EditTicketModal
        show={showEditTicketModal}
        handleShow={setShowEditTicketModal}
        readOnly={!isAllowedToEdit}
        ticketId={currentTicket}
        tickets={tickets}
      />
      {/* )} */}
      <div className="h-12"></div>
      {tickets?.length === 0 && movements?.length === 0 && (
        <div className="flex justify-center py-3">
          <h3 className=" text-slate-400">No hay movimientos en esta caja</h3>
        </div>
      )}
      {tickets &&
        tickets.map((ticket, i) => (
          <TicketCard key={i} ticket={ticket} onClick={() => handleTicketClick(ticket.id)} />
        ))}
      {movements && movements.map((movement, i) => <MovementCard key={i} movement={movement} />)}
    </div>
  );
});

export default Carousel;
