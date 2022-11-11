import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Button from "../../components/Button";
import { useReport } from "../../hooks/use-report";

const Admin: NextPage = () => {
  const { data: session } = useSession();

  const date = new Date(new Date().setDate(new Date().getDate() - 14));
  const { downloadReport, isLoading } = useReport(date);

  if (session?.user?.email !== "juampicarosi@gmail.com" && session?.user?.email !== "ac@cldproyectos.com") {
    return <>No tenes acceso a esta pagina</>;
  }

  return (
    <>
      <Button label="Descargar reporte" disabled={isLoading} onClick={() => downloadReport()} />
    </>
  );
};

export default Admin;
