import { memo, useMemo, useState } from "react";
import { trpc } from "../utils/trpc";
import MovementCard from "./Movement/Card";

import TicketCard from "./Ticket/Card";
import EditTicketModal from "./Ticket/EditModal";

const Carousel = memo(function Carousel({ currentPettyCash }: { currentPettyCash: Date }) {
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);

  const { data: movements, isLoading: areMovementsLoading } =
    trpc.movements.getByDate.useQuery(currentPettyCash);
  const { data: tickets, isLoading: areTicketLoading } = trpc.tickets.getByDate.useQuery(currentPettyCash);

  const handleTicketClick = (ticketId: string) => {
    setShowEditTicketModal(true);
    setCurrentTicket(ticketId);
  };

  const isAllowedToEdit = useMemo(() => {
    return !currentPettyCash || currentPettyCash >= new Date();
  }, [currentPettyCash]);

  return (
    <div className="m-auto max-w-lg">
      <EditTicketModal
        show={showEditTicketModal}
        handleShow={setShowEditTicketModal}
        readOnly={!isAllowedToEdit}
        ticketId={currentTicket}
        tickets={tickets}
      />
      {areMovementsLoading && areTicketLoading ? (
        <div className="mt-10 flex w-full justify-center text-sm font-semibold text-slate-500">
          <h2 className="py-4">Cargando Tickets y Movimientos...</h2>
        </div>
      ) : (
        <>
          {" "}
          <div className="h-12"></div>
          {tickets?.length === 0 && movements?.length === 0 && (
            <div className="flex justify-center py-3">
              <h3 className=" text-slate-400">No hay movimientos en esta caja</h3>
            </div>
          )}
          {tickets?.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onClick={() => handleTicketClick(ticket.id)} />
          ))}
          {movements?.map((movement) => (
            <MovementCard key={movement.id} movement={movement} />
          ))}
        </>
      )}
    </div>
  );
});

export default Carousel;
