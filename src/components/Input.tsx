import { HTMLInputTypeAttribute } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";

type InputProps = {
  type?: HTMLInputTypeAttribute;
  label?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  children?: React.ReactNode;
  name?: string;
  value?: string;
  register: UseFormRegister<FieldValues>;
};

const Input = (props: InputProps) => {
  const { type = "text", label, name, style, placeholder, children, value, register } = props;
  if (!name) throw new Error("Input component needs a name prop");
  const { onChange, ref } = register(name);

  return (
    <div className="flex flex-col p-2">
      <label>{label}</label>
      <input
        className="rounded-lg text-slate-600 font-light border-gray-300 h-10 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        type={type}
        onChange={onChange}
        name={name}
        ref={ref}
        defaultValue={value}
        placeholder={placeholder}
        style={style}
      />
      {children}
    </div>
  );
};

export default Input;
