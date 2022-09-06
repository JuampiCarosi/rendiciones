import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import defaultProfilePicture from "../../public/profile.png";

const Top = () => {
  const { data: session } = useSession();
  const profilePicture = session?.user?.image || defaultProfilePicture;

  return (
    <>
      <div className="flex h-16	 items-center justify-between bg-slate-600 px-4 text-xl text-white">
        <h2>Rendiciones</h2>
        <Image
          src={profilePicture}
          alt="Profile"
          height="48px"
          width="48px"
          className="rounded-full"
          onDoubleClick={() => signOut()}
        />
      </div>
    </>
  );
};

export default Top;
