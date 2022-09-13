import { Movements } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import { trpc } from "../utils/trpc";

type MovementCardProps = {
  movement: Movements;
  isMovement?: boolean;
};

const formatoPesos = new Intl.NumberFormat("es-AR");

const MovementCard = ({ movement }: MovementCardProps) => {
  const { data: session } = useSession();

  const expenseType = movement.fromUser === session?.user?.id ? "Egreso" : "Ingreso";
  const expenseColor = movement.fromUser === session?.user?.id ? "red" : "green";
  const movementPreposition = movement.fromUser === session?.user?.id ? "Para" : "De";
  const { data: movementUser } = trpc.proxy.users.getById.useQuery(movement.fromUser);
  return (
    <div className=" p-2">
      <div className=" flex flex-col items-start rounded-lg border	border-gray-300 p-4	text-center">
        <div className=" w-full overflow-hidden text-ellipsis whitespace-nowrap	pb-1 text-lg font-semibold">
          <span>{`${movementPreposition}: ${movementUser?.name}`}</span>
        </div>
        <div className="flex w-full justify-between	">
          <span
            className={`w-fit rounded-full bg-${expenseColor}-200 px-2 py-1 text-sm font-bold text-${expenseColor}-800`}
          >
            {expenseType}
          </span>
          <span>{movement.description}</span>
          <span>$ {formatoPesos.format(movement.amount)}</span>
        </div>
      </div>
    </div>
  );
};

export default MovementCard;
