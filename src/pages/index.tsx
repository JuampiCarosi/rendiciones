import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Top from "../components/Top";
import TicketModal from "../components/Ticket/Modal";
import { useEffect, useState } from "react";

import EntryModal from "../components/Movement/Modal";
import { trpc } from "../utils/trpc";
import TicketCard from "../components/Ticket/Card";
import MovementCard from "../components/Movement/Card";
import Bottom from "../components/Bottom";
import EditTicketModal from "../components/Ticket/EditModal";
import { getNextWednesday } from "../utils/helpers";

const Home: NextPage = () => {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [currentPettyCash, setCurrentPettyCash] = useState<Date>(getNextWednesday(new Date()));
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const utils = trpc.useContext();

  const { data: movements } = trpc.movements.getByDate.useQuery(currentPettyCash, { keepPreviousData: true });
  const { data: tickets } = trpc.tickets.getByDate.useQuery(currentPettyCash, { keepPreviousData: true });

  const handleShowTicketModal = (value: boolean) => {
    setShowTicketModal(value);
  };

  const handleShowEntryModal = (value: boolean) => {
    setShowEntryModal(value);
  };

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

  const updateCurrentPettyCash = (date: Date) => {
    setCurrentPettyCash(date);
    utils.tickets.getByDate.invalidate();
    utils.movements.getByDate.invalidate();
  };

  return (
    <div className="flex h-full flex-col">
      <Top setPettyCash={updateCurrentPettyCash} currentPettyCash={currentPettyCash} />
      <div className="w-full grow overflow-scroll pt-2">
        <div className="m-auto max-w-lg">
          <TicketModal show={showTicketModal} handleShow={handleShowTicketModal} />
          <EntryModal show={showEntryModal} handleShow={handleShowEntryModal} />
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
      </div>
      <Bottom handleShowEntryModal={handleShowEntryModal} handleShowTicketModal={handleShowTicketModal} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
};

export default Home;
