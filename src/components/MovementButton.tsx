import { IconType } from "react-icons/lib";

const MovementButton: ({}: MovementButtonProps) => JSX.Element = ({ label, Icon, style }) => {
  return (
    <div>
      <button
        style={style}
        className="bg-neutral-500 text-white rounded-lg h-10 px-2 flex items-center justify-center"
      >
        {Icon && <Icon />}
        {label}
      </button>
    </div>
  );
};

export default MovementButton;

type MovementButtonProps = {
  onClick?: () => void;
  label: string;
  Icon?: IconType;
  style?: React.CSSProperties;
};
