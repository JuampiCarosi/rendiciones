import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Top from "../components/Top";
import { useState } from "react";
import EntryModal from "../components/Movement/Modal";
import TicketModal from "../components/Ticket/Modal";

import { trpc } from "../utils/trpc";
import Bottom from "../components/Bottom";
import { getNextWednesday } from "../utils/helpers";
import Carousel from "../components/Carousel";

const Home: NextPage = () => {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [currentPettyCash, setCurrentPettyCash] = useState<Date>(getNextWednesday(new Date()));
  const utils = trpc.useContext();

  const handleShowTicketModal = (value: boolean) => {
    setShowTicketModal(value);
  };

  const handleShowEntryModal = (value: boolean) => {
    setShowEntryModal(value);
  };

  const updateCurrentPettyCash = (date: Date) => {
    setCurrentPettyCash(date);
    utils.tickets.getByDate.invalidate();
    utils.movements.getByDate.invalidate();
  };

  return (
    <div className="flex h-full flex-col">
      <Top setPettyCash={updateCurrentPettyCash} currentPettyCash={currentPettyCash} />
      <div className="w-full grow overflow-scroll pt-2">
        <TicketModal show={showTicketModal} handleShow={handleShowTicketModal} />
        <EntryModal show={showEntryModal} handleShow={handleShowEntryModal} />
        <Carousel currentPettyCash={currentPettyCash} />
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
