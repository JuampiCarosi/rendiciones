import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Table from "../../components/Table";
import { getNextWednesday } from "../../utils/helpers";
import { trpc } from "../../utils/trpc";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "balance", header: "Saldo" },
];

const Admin: NextPage = () => {
  const { data: session } = useSession();
  const { data } = trpc.balances.getAll.useQuery();

  const { data: report } = trpc.balances.generateReport.useQuery(getNextWednesday(new Date()));
  console.log(report);

  if (session?.user?.email !== "juampicarosi@gmail.com" && session?.user?.email !== "ac@cldproyectos.com") {
    return <>No tenes acceso a esta pagina</>;
  }
  if (!data) return <>Cargando...</>;

  return (
    <>
      <Table data={data} columns={columns} />
    </>
  );
};

export default Admin;
