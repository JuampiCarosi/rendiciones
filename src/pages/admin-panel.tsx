import { GetServerSideProps, NextPage } from "next";

import Top from "../components/Top";
import { useState } from "react";
import { getNextWednesday, parsePettyCashDate } from "../utils/helpers";
import { FileLineChart, Store, UserSquare2 } from "lucide-react";
import { trpc } from "../utils/trpc";
import clsx from "clsx";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

const Home: NextPage = () => {
  const [currentPettyCash, setCurrentPettyCash] = useState<Date>(getNextWednesday(new Date()));
  const mutation = trpc.balances.generateReport.useMutation();

  return (
    <div>
      <Top currentPettyCash={currentPettyCash} setPettyCash={setCurrentPettyCash} />

      <div className="mx-5 flex  flex-col gap-3 pt-20">
        <div
          onClick={() =>
            !mutation.isLoading &&
            mutation.mutate(getNextWednesday(currentPettyCash), {
              onSuccess: ({ report }) => {
                const mediaType =
                  "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
                const a = document.createElement("a");
                a.href = `${mediaType}${report}`;
                a.download = `${parsePettyCashDate(currentPettyCash).label}.xlsx`;
                a.click();
              },
            })
          }
          className="flex cursor-pointer  items-center gap-3  border-b border-slate-400 pt-2 pb-4 text-slate-600 hover:underline "
        >
          <FileLineChart />
          <h3 className={clsx("text-xl", mutation.isLoading && "text-slate-500 ")}>
            {mutation.isLoading ? "Generando Reporte..." : "Generar Reporte"}
          </h3>
        </div>
        <div className="flex cursor-pointer  items-center gap-3  border-b border-slate-400 pt-2 pb-4 text-slate-600 hover:underline">
          <Store />
          <h3 className=" text-xl ">Administrar Centro de Costos</h3>
        </div>
        <div className="flex cursor-pointer  items-center gap-3  border-b border-slate-400 pt-2 pb-4 text-slate-600 hover:underline">
          <UserSquare2 />
          <h3 className=" text-xl ">Administrar Usuarios</h3>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  if (!session.user?.isAdmin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default Home;
