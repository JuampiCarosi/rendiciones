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

const Home: NextPage = () => {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [pettyCashDate, setPettyCashDate] = useState<Date>();

  const { data: movements } = trpc.proxy.movements.getAll.useQuery();
  const { data: pettyCash } = trpc.proxy.tickets.getCurrentPettyCash.useQuery();
  const { data: tickets } = trpc.proxy.tickets.getByDate.useQuery(pettyCashDate || new Date());

  useEffect(() => {
    if (pettyCash) setPettyCashDate(pettyCash.date);
  }, [pettyCash]);

  const handleShowTicketModal = (value: boolean) => {
    setShowTicketModal(value);
  };

  const handleShowEntryModal = (value: boolean) => {
    setShowEntryModal(value);
  };

  return (
    <div className="flex h-full flex-col">
      <Top setPettyCashDate={setPettyCashDate} />
      <TicketModal show={showTicketModal} handleShow={handleShowTicketModal} />
      <EntryModal show={showEntryModal} handleShow={handleShowEntryModal} />
      <div className="w-full grow overflow-scroll pt-2">
        <div className="h-12"></div>
        {tickets && tickets.map((ticket, i) => <TicketCard key={i} ticket={ticket} />)}
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
