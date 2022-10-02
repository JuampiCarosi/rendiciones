import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Top from "../components/Top";
import TicketModal from "../components/TicketModal";
import { useEffect, useState } from "react";

import EntryModal from "../components/MovementModal";
import { trpc } from "../utils/trpc";
import TicketCard from "../components/TicketCard";
import MovementCard from "../components/MovementCard";
import Bottom from "../components/Bottom";
import EditTicketModal from "../components/EditTicketModal";
import { Ticket } from "@prisma/client";

const Home: NextPage = () => {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [currentPettyCash, setCurrentPettyCash] = useState<Date>();
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket>();

  const { data: movements } = trpc.movements.getByDate.useQuery(currentPettyCash || new Date());
  const { data: pettyCash } = trpc.tickets.getCurrentPettyCash.useQuery();
  const { data: tickets } = trpc.tickets.getByDate.useQuery(currentPettyCash || new Date());

  useEffect(() => {
    if (pettyCash) setCurrentPettyCash(pettyCash.date);
  }, [pettyCash]);

  const handleShowTicketModal = (value: boolean) => {
    setShowTicketModal(value);
  };

  const handleShowEntryModal = (value: boolean) => {
    setShowEntryModal(value);
  };

  const handleShowEditTicketModal = (value: boolean) => {
    setShowEditTicketModal(value);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setShowEditTicketModal(true);
    setCurrentTicket(ticket);
  };

  return (
    <div className="flex h-full flex-col">
      <Top setPettyCash={setCurrentPettyCash} />
      <TicketModal show={showTicketModal} handleShow={handleShowTicketModal} />
      <EntryModal show={showEntryModal} handleShow={handleShowEntryModal} />
      {currentTicket && (
        <EditTicketModal
          show={showEditTicketModal}
          handleShow={handleShowEditTicketModal}
          {...currentTicket}
        />
      )}
      <div className="w-full grow overflow-scroll pt-2">
        <div className="h-12"></div>
        {tickets &&
          tickets.map((ticket, i) => (
            <TicketCard key={i} ticket={ticket} onClick={() => handleEditTicket(ticket)} />
          ))}
        {movements && movements.map((movement, i) => <MovementCard key={i} movement={movement} />)}
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
