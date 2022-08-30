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
    <div className="grid gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        className="rounded-lg text-gray-800 font-light border-gray-300 h-10 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

export const SelectInput = (props: any) => {
  const {
    label,
    disabled = false,
    errors = {},
    errMsg,
    children,
    onChange,
    name,
    value,
    register,
    data,
    autoFocus,
    emptyOption = true,
  } = props;

  return (
    <div className="grid gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      <select
        className="rounded-lg text-gray-800 font-light border-gray-300 h-10 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        name={name}
        disabled={disabled}
        defaultValue={value}
        onChange={onChange}
        ref={register}
        autoComplete="off"
        autoFocus={autoFocus}
      >
        {emptyOption && <option value="">------</option>}
        {data.map((opt: any, i: number) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {errors[name] && <span className="error">{errMsg}</span>}
      {children}
    </div>
  );
};

export default Input;
