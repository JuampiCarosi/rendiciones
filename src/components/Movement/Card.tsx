import { Movements } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import { trpc } from "../../utils/trpc";

type MovementCardProps = {
  movement: Movements;
  isMovement?: boolean;
};

const formatoPesos = new Intl.NumberFormat("es-AR");

const MovementCard = ({ movement }: MovementCardProps) => {
  const { data: session } = useSession();

  const expenseType =
    movement.fromUser === session?.user?.id
      ? "Egreso"
      : movement.toUser === session?.user?.id
      ? "Ingreso"
      : "Caja central";
  const expenseColor =
    movement.fromUser === session?.user?.id
      ? "bg-red-200 text-red-800"
      : movement.toUser === session?.user?.id
      ? "bg-green-200 text-green-800"
      : "bg-purple-200 text-purple-800";
  const movementPreposition = movement.fromUser === session?.user?.id ? "Para" : "De";
  const { data: movementUser } = trpc.users.getById.useQuery(
    session?.user?.id ? movement.toUser : movement.fromUser
  );

  return (
    <div className=" p-2">
      <div className=" flex flex-col items-start gap-1 rounded-lg border	bg-gray-50 p-4 shadow-sm">
        <div className=" w-full overflow-hidden text-ellipsis whitespace-nowrap	pb-1 text-lg font-semibold">
          <span>{`${movementPreposition}: ${movementUser?.name}`}</span>
        </div>
        <div className="flex w-full justify-between	">
          <span className={`w-fit rounded-full ${expenseColor} px-2 py-1 text-sm font-bold ${expenseColor}`}>
            {expenseType}
          </span>
          <div className="flex w-36 justify-around ">
            <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center">
              {movement.description}
            </span>
          </div>
          <span>$ {formatoPesos.format(movement.amount)}</span>
        </div>
      </div>
    </div>
  );
};

export default MovementCard;
