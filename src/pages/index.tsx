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
import Table from "../components/Table";
import { trpc } from "../utils/trpc";
import { ColumnDef } from "@tanstack/react-table";
import { Movements, Ticket } from "@prisma/client";

const Home: NextPage = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<"tickets" | "movements">("movements");

  const toggleTable = () => {
    if (selectedTable === "tickets") {
      setSelectedTable("movements");
    } else {
      setSelectedTable("tickets");
    }
  };

  const { data: tickets } = trpc.proxy.tickets.getAll.useQuery();
  const { data: movements } = trpc.proxy.movements.getAll.useQuery();

  const handleShowInvoiceModal = (value: boolean) => {
    setShowInvoiceModal(value);
  };

  const ticketColumns: ColumnDef<Ticket>[] = [
    {
      header: "Fecha",
      accessorKey: "invoiceDate",
      cell: ({ getValue }) => (
        <span>
          {(getValue() as Date)?.toLocaleDateString("es", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })}
        </span>
      ),
    },
    { header: "Descripción", accessorKey: "description" },
    {
      header: "Factura",
      accessorKey: "invoiceType",
      cell: ({ getValue }) => <span>{(getValue() as string).toUpperCase()}</span>,
    },
    { header: "Tipo", accessorKey: "expenseType" },
    {
      header: "Monto",
      accessorKey: "amount",
      cell: ({ getValue }) => <span>${formatoPesos.format(getValue() as number)}</span>,
    },
  ];

  const movementsColumns: ColumnDef<Movements>[] = [
    {
      header: "Fecha",
      accessorKey: "date",
      cell: ({ getValue }) => (
        <span>
          {(getValue() as Date)?.toLocaleDateString("es", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })}
        </span>
      ),
    },
    { header: "Descripción", accessorKey: "description" },
    {
      header: "Monto",
      accessorKey: "amount",
      cell: ({ getValue }) => <span>${formatoPesos.format(getValue() as number)}</span>,
    },
  ];

  const formatoPesos = new Intl.NumberFormat("es-AR");

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
      <div className=" p-2">
        <div className=" flex flex-col items-start rounded-lg border	border-gray-300 p-4	text-center">
          <div className=" w-full overflow-hidden text-ellipsis whitespace-nowrap	pb-1 text-lg font-semibold">
            <span>Nafta en Shell y un par de detalles y unas cosillas</span>
          </div>
          <div className="grid w-full	 grid-cols-2">
            <span className="w-fit rounded-full bg-red-200 px-2 py-1 text-sm font-bold text-red-800 ">
              Combustible
            </span>
            <div className="flex  justify-between">
              <span>Fact. A</span>
              <span>$ 1.000.000</span>
            </div>
          </div>
        </div>
      </div>
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
