import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import defaultProfilePicture from "../../public/profile.png";
import { trpc } from "../utils/trpc";
import Button from "./Button";
import { getNextWednesday, parsePettyCashDate } from "../utils/helpers";

type Props = {
  setPettyCash: (pettyCash: Date) => void;
  currentPettyCash: Date;
};

const Top = ({ setPettyCash, currentPettyCash }: Props) => {
  const { data: session } = useSession();
  const profilePicture = session?.user?.image || defaultProfilePicture;

  const { data: balance } = trpc.balances.getBalance.useQuery();
  const formatoPesos = new Intl.NumberFormat("es-AR");

  const { data: pettyCashDates } = trpc.pettyCash.getDates.useQuery();
  const mutation = trpc.balances.generateReport.useMutation();

  return (
    <div className="absolute flex h-12 w-full items-center justify-between gap-4 bg-white px-4 text-slate-600  shadow-md shadow-slate-200">
      <select
        onChange={(e) => setPettyCash(new Date(e.target.value))}
        className="rounded border-none text-lg outline-none focus:border-none focus:outline-none active:outline-none"
      >
        {pettyCashDates &&
          pettyCashDates.map((pettycash, i) => (
            <option key={i} value={pettycash.date.toDateString()}>
              {pettycash.label}
            </option>
          ))}
      </select>
      <div className="flex items-center gap-4">
        {session?.user?.isAdmin ? (
          <>
            <Button
              label={mutation.isLoading ? "Generando reporte..." : "Descargar reporte"}
              disabled={mutation.isLoading}
              onClick={() =>
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
            />
          </>
        ) : (
          <span className="text-md rounded-md bg-slate-300 px-4 py-1">
            $ {formatoPesos.format(balance || 0)}
          </span>
        )}
        <Image
          src={profilePicture}
          alt="Profile"
          height="40px"
          width="40px"
          className="rounded-full"
          onDoubleClick={() => signOut()}
        />
      </div>
    </div>
  );
};

export default Top;
