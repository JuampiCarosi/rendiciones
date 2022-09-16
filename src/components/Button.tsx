import { IconType } from "react-icons/lib";

const Button: ({}: ButtonProps) => JSX.Element = ({ label, Icon, style, onClick }) => {
  return (
    <div>
      <button
        style={style}
        className="flex h-10 items-center justify-center rounded-lg bg-slate-500 px-2 text-white"
        onClick={() => onClick()}
      >
        {Icon && <Icon />}
        {label}
      </button>
    </div>
  );
};

export default Button;

type ButtonProps = {
  onClick: () => void;
  label: string;
  Icon?: IconType;
  style?: React.CSSProperties;
};
