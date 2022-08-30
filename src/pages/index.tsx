import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Top from "../components/Top";
import ActionsBar from "../components/ActionsBar";
import InvoiceModal from "../components/InvoiceModal";
import { useState } from "react";

const Home: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Top />
      <ActionsBar />
      <button onClick={() => setShowModal((prev) => !prev)}>Open modal</button>
      <InvoiceModal
        handleClose={() => setShowModal(false)}
        handleSubmit={(data) => setShowModal(false)}
        show={showModal}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);
  console.log(session);
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
