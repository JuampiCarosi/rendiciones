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
    <div className="flex h-16	 items-center justify-between bg-slate-600 px-4  text-white">
      <Image
        src={profilePicture}
        alt="Profile"
        height="48px"
        width="48px"
        className="rounded-full"
        onDoubleClick={() => signOut()}
      />
      <div className="flex justify-between gap-2 text-lg ">
        <h2>Saldo:</h2>
        <span>${formatoPesos.format(balance || 0)}</span>
      </div>
    </div>
  );
};

export default Top;
