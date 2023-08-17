// import { AlertDialog } from "@/ui/alert-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AlertDialog } from "../components/AlertDialog";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md border text-sm text-slate-700  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-indigo-100 dark:hover:bg-indigo-800 dark:hover:text-indigo-100 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-indigo-900 dark:data-[state=open]:bg-indigo-800",
  {
    variants: {
      variant: {
        default:
          "border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700 dark:border-blue-50 dark:bg-blue-50 dark:text-blue-900",
        destructive:
          "border-red-500 bg-red-500 text-white hover:border-red-600 hover:bg-red-600 focus-visible:ring-red-400 data-[state=open]:border-red-400 data-[state=open]:bg-red-400 dark:hover:border-red-600 dark:hover:bg-red-600 dark:focus-visible:ring-red-400 dark:data-[state=open]:border-red-800 dark:data-[state=open]:bg-red-800",
        success:
          "border-green-500 bg-green-500 text-white hover:border-green-600 hover:bg-green-600 focus-visible:ring-green-400 data-[state=open]:border-green-400 data-[state=open]:bg-green-400 dark:hover:border-green-600 dark:hover:bg-green-600 dark:focus-visible:ring-green-400 dark:data-[state=open]:border-green-800 dark:data-[state=open]:bg-green-800",
        outline:
          "border-slate-150 bg-transparent bg-white shadow-sm  shadow-slate-150 hover:bg-slate-100 focus-visible:ring-slate-300 data-[state=open]:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:focus-visible:ring-slate-400 dark:data-[state=open]:bg-slate-800",
        subtle:
          "border-slate-100 bg-slate-100 text-slate-900 hover:border-slate-200 hover:bg-slate-200 data-[state=open]:border-slate-100 data-[state=open]:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:data-[state=open]:border-slate-800 dark:data-[state=open]:bg-slate-800",
        ghost:
          "border-white bg-white hover:border-slate-100 hover:bg-slate-100 data-[state=open]:border-transparent data-[state=open]:bg-transparent dark:text-slate-100 dark:hover:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:data-[state=open]:border-transparent dark:data-[state=open]:bg-transparent",
        link: "border-transparent bg-transparent text-slate-900 underline-offset-4 hover:bg-transparent hover:underline dark:bg-transparent dark:text-slate-100 dark:hover:bg-transparent",
        gray: "border-transparent bg-slate-500 text-slate-100  hover:bg-slate-600 data-[state=open]:border-slate-100 data-[state=open]:bg-slate-100 dark:border-slate-400 dark:bg-slate-400 dark:text-slate-100 dark:data-[state=open]:border-slate-700 dark:data-[state=open]:bg-slate-700",
      },
      size: {
        default: "px-3 py-1.5",
        sm: "rounded-md py-1 px-2",
        lg: "rounded-md py-2 px-4",
      },
      icon: {
        true: "px-1 py-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export async function dialog(props: {
  title: string;
  description?: string;
  body?: ReactNode;
  onCancel?: () => void;
  action?:
    | string
    | {
        label: string;
        variant?: VariantProps<typeof buttonVariants>["variant"];
      };
  cancel?:
    | string
    | {
        label: string;
        variant?: VariantProps<typeof buttonVariants>["variant"];
      };
}): Promise<boolean> {
  return new Promise((resolve) => {
    let open = true;

    const onCancel = () => {
      open = false;
      render();
      resolve(false);
    };

    const onConfirm = () => {
      open = false;
      resolve(true);
      render();
    };

    const mountRoot = createRoot(document.createElement("div"));

    const render = () => {
      mountRoot.render(<Dialog open={open} props={props} onCancel={onCancel} onConfirm={onConfirm} />);
    };

    render();
  });
}
function Dialog({
  open,
  props,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  props: {
    title: string;
    description?: string | undefined;
    body?: ReactNode;
    onCancel?: (() => void) | undefined;
    action?:
      | string
      | {
          label: string;
          variant?: VariantProps<typeof buttonVariants>["variant"];
        };
    cancel?:
      | string
      | {
          label: string;
          variant?: VariantProps<typeof buttonVariants>["variant"];
        };
  };
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel, open]);

  return (
    <AlertDialog open={open}>
      <AlertDialog.Title>{props.title}</AlertDialog.Title>
      {props.description && <AlertDialog.Description>{props.description}</AlertDialog.Description>}
      {props.body}
      <AlertDialog.Footer>
        <AlertDialog.Cancel
          className="inline-flex  w-full justify-center rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-base  font-medium text-gray-500  shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={onCancel}
        >
          {typeof props.cancel === "string" ? props.cancel : props.cancel?.label ?? "Cancelar"}
        </AlertDialog.Cancel>
        <AlertDialog.Action
          onClick={onConfirm}
          className="my-2 inline-flex w-full justify-center rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2 text-base  font-medium text-white shadow-sm hover:bg-indigo-700  sm:mt-0 sm:w-auto sm:text-sm"
        >
          {typeof props.action === "string" ? props.action : props.action?.label ?? "Confirmar"}
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog>
  );
}
