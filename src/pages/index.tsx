import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Top from "../components/Top";
import InvoiceModal from "../components/InvoiceModal";
import { useState } from "react";
import { FaFileInvoice } from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";
import MovementButton from "../components/MovementButton";
import EntryModal from "../components/EntryModal";

const Home: NextPage = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);

  const handleShowInvoiceModal = (value: boolean) => {
    setShowInvoiceModal(value);
  };

  return (
    <>
      <Top />
      <div className="flex justify-around pt-4">
        <MovementButton
          label="Nuevo ticket"
          onClick={() => setShowInvoiceModal((prev) => !prev)}
          Icon={FaFileInvoice}
        />
        <MovementButton
          label="Nuevo moviemiento de caja"
          onClick={() => setShowEntryModal((prev) => !prev)}
          Icon={TbReportMoney}
        />
      </div>
      <InvoiceModal show={showInvoiceModal} handleShow={handleShowInvoiceModal} />
      <EntryModal show={showEntryModal} handleShow={setShowEntryModal} />
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
