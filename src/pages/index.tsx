import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Top from "../components/Top";
import TicketModal from "../components/TicketModal";
import { useState } from "react";
import { FaFileInvoice } from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";
import MovementButton from "../components/MovementButton";
import EntryModal from "../components/MovementModal";
import { trpc } from "../utils/trpc";
import TicketCard from "../components/TicketCard";
import MovementCard from "../components/MovementCard";

const Home: NextPage = () => {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);

  const { data: tickets } = trpc.proxy.tickets.getAll.useQuery();
  const { data: movements } = trpc.proxy.movements.getAll.useQuery();

  const handleShowTicketModal = (value: boolean) => {
    setShowTicketModal(value);
  };

  const handleShowEntryModal = (value: boolean) => {
    setShowEntryModal(value);
  };

  return (
    <>
      <Top />
      <div className="flex justify-around pt-4">
        <MovementButton
          label="Nuevo ticket"
          onClick={() => setShowTicketModal((prev) => !prev)}
          Icon={FaFileInvoice}
        />
        <MovementButton
          label="Nuevo moviemiento de caja"
          onClick={() => setShowEntryModal((prev) => !prev)}
          Icon={TbReportMoney}
        />
      </div>
      <TicketModal show={showTicketModal} handleShow={handleShowTicketModal} />
      <EntryModal show={showEntryModal} handleShow={handleShowEntryModal} />
      {tickets && tickets.map((ticket, i) => <TicketCard key={i} ticket={ticket} />)}
      {movements && movements.map((movement, i) => <MovementCard key={i} movement={movement} />)}
    </>
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
