import { Listbox } from "@headlessui/react";
import { HTMLInputTypeAttribute } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { cn } from "../utils/cn";

type InputProps = {
  type?: HTMLInputTypeAttribute;
  label?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  placeholder?: string;
  children?: React.ReactNode;
  name?: string;
  value?: string;
  register?: UseFormRegister<FieldValues>;
  required?: boolean;
  className?: string;
};

type SelectInputProps = {
  label: string;
  disabled?: boolean;
  errors?: Record<string, string>;
  errMsg?: string;
  children?: React.ReactNode;
  name: string;
  value?: string;
  register?: UseFormRegister<FieldValues>;
  required?: boolean;
  data: { value: string; label: string }[];
  autoFocus?: boolean;
  emptyOption?: boolean;
};

type MultipleSelectInputProps = {
  label: string;
  errors?: Record<string, string>;
  errMsg?: string;
  children?: React.ReactNode;
  name: string;
  data: string[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  disabled?: boolean;
};

const Input = (props: InputProps) => {
  const {
    type = "text",
    label,
    name,
    style,
    placeholder,
    children,
    value,
    register,
    required,
    className,
    disabled,
  } = props;
  if (!name) throw new Error("Input component needs a name prop");
  return (
    <div className={cn(type === "checkbox" ? "flex items-center gap-2 pt-2" : "grid gap-1")}>
      <label className="text-sm text-gray-600">{label}</label>
      {register ? (
        <input
          className={cn(
            "h-10 w-full rounded-lg border-gray-300 font-light text-gray-800  focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50",
            disabled && "bg-slate-100",
            type === "checkbox" && "h-4 w-4 rounded-sm",
            className
          )}
          type={type}
          {...register(name, { required, valueAsNumber: type === "number", valueAsDate: type === "date" })}
          defaultValue={value}
          placeholder={placeholder}
          disabled={disabled}
          style={style}
          autoComplete="off"
        />
      ) : (
        <input
          className={cn(
            "h-10 w-full rounded-lg border-gray-300 font-light text-gray-800  focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50",
            disabled && "bg-slate-100",
            className
          )}
          type={type}
          defaultValue={value}
          placeholder={placeholder}
          disabled={disabled}
          style={style}
          autoComplete="off"
        />
      )}
      {children}
    </div>
  );
};

export const SelectInput = (props: SelectInputProps) => {
  const {
    label,
    disabled = false,
    errors = {},
    errMsg,
    children,
    name,
    value,
    register,
    required,
    data,
    autoFocus,
    emptyOption = true,
  } = props;

  return (
    <div className="grid gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      {register ? (
        <select
          className={`h-10 rounded-lg border-gray-300 ${
            disabled ? "bg-slate-100" : ""
          } font-light text-gray-800 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          disabled={disabled}
          defaultValue={value}
          {...register(name, { required })}
          autoComplete="off"
          autoFocus={autoFocus}
        >
          {emptyOption && <option value="">------</option>}
          {data.map((opt, i: number) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <select
          className={`h-10 rounded-lg border-gray-300 ${
            disabled ? "bg-slate-100" : ""
          } font-light text-gray-800 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          disabled={disabled}
          defaultValue={value}
          autoComplete="off"
          autoFocus={autoFocus}
        >
          {emptyOption && <option value="">------</option>}
          {data.map((opt, i: number) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      {errors[name] && <span className="error">{errMsg}</span>}
      {children}
    </div>
  );
};

export const MultipleSelectInput = (props: MultipleSelectInputProps) => {
  const {
    label,
    errors = {},
    errMsg,
    children,
    name,
    data,
    selectedItems,
    setSelectedItems,
    disabled = false,
  } = props;

  return (
    <div className="grid gap-1">
      <Listbox disabled={disabled} value={selectedItems} onChange={setSelectedItems} multiple>
        <Listbox.Label className="text-sm text-gray-600">{label}</Listbox.Label>
        <Listbox.Button
          className={` h-10 rounded-lg border	border-gray-300 px-3 text-left ${
            disabled ? "bg-slate-100" : ""
          } font-light text-gray-800 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
        >
          {selectedItems.length > 0 ? selectedItems.map((item) => item).join(", ") : "------"}
        </Listbox.Button>
        <Listbox.Options className=" absolute mt-16 h-36 w-36 overflow-y-scroll rounded-md border border-b-0 bg-white pt-1 text-lg font-light shadow-lg focus:outline-none ">
          {data.map((item) => {
            return (
              <Listbox.Option
                className="cursor-pointer border-b py-0.5 pl-3 hover:bg-gray-50"
                key={item}
                value={item}
              >
                {({ selected }) => (
                  <div className="flex">
                    <span className={`block truncate ${selected ? "font-semibold" : ""}`}>{item}</span>
                  </div>
                )}
              </Listbox.Option>
            );
          })}
        </Listbox.Options>
      </Listbox>
      {errors[name] && <span className="error">{errMsg}</span>}
      {children}
    </div>
  );
};

export default Input;
