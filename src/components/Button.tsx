import { IconType } from "react-icons/lib";

const Button: ({}: ButtonProps) => JSX.Element = ({
  label,
  Icon,
  style,
  onClick,
  className,
  disabled = false,
}) => {
  return (
    <div>
      <button
        disabled={disabled}
        style={style}
        className={`flex h-10 items-center justify-center rounded-lg ${
          disabled ? "bg-slate-300" : "bg-slate-500"
        } px-2 text-white ${className}`}
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
  className?: string;
  disabled?: boolean;
};
