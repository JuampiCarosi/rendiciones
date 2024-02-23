import { forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "../utils/cn";
import { Label } from "./label";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, name, label, ...props }, ref) => {
  const ctx = useFormContext();
  const id = useId();
  return (
    <div className={cn(className, "flex items-center ")}>
      <input
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ref={ref}
        id={id}
        type="checkbox"
        {...(ctx && name ? ctx.register(name) : {})}
        {...props}
      />
      {label && (
        <Label
          htmlFor={id}
          className="-mb-0.5 pl-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
      )}
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
