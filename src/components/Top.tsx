import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import defaultProfilePicture from "../../public/profile.png";
import { trpc } from "../utils/trpc";

const Top = () => {
  const { data: session } = useSession();
  const profilePicture = session?.user?.image || defaultProfilePicture;

  const { data: balance } = trpc.proxy.balances.getBalance.useQuery();
  const formatoPesos = new Intl.NumberFormat("es-AR");

  return (
    <div className="absolute flex h-12 w-full items-center justify-between gap-4 bg-white px-4 text-slate-600  shadow-md shadow-slate-200">
      <select className="rounded border-none text-lg outline-none focus:border-none focus:outline-none active:outline-none">
        <option className="">Marzo 10-17</option>
      </select>
      <div className="flex items-center gap-4">
        <span className="text-md rounded-md bg-slate-300 px-4 py-1">
          $ {formatoPesos.format(balance || 0)}
        </span>
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
