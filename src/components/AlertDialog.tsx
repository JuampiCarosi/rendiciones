import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef, ReactNode, HTMLAttributes } from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "../utils/cn";
import Button from "./Button";

/*****  ALERT DIALOG *****/
type AlertDialogProps = AlertDialogPrimitive.AlertDialogProps &
  AlertDialogPrimitive.AlertDialogContentProps & { trigger?: ReactNode | string };

const AlertDialog = (props: AlertDialogProps) => {
  const { defaultOpen, key, onOpenChange, open, trigger, ...contentProps } = props;

  return (
    <AlertDialogPrimitive.Root {...{ defaultOpen, key, onOpenChange, open }}>
      {Boolean(trigger) && (
        <AlertDialogTrigger asChild={typeof trigger !== "string"}>{trigger}</AlertDialogTrigger>
      )}
      <AlertDialogContent {...contentProps} />
    </AlertDialogPrimitive.Root>
  );
};
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

/*****  PORTAL  *****/
const AlertDialogPortal = ({
  className,
  children,
  ...props
}: AlertDialogPrimitive.AlertDialogPortalProps) => (
  <AlertDialogPrimitive.Portal className={cn(className)} {...props}>
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">{children}</div>
  </AlertDialogPrimitive.Portal>
);
AlertDialogPortal.displayName = AlertDialogPrimitive.Portal.displayName;

/*****  OVERLAY  *****/
type AlertDialogOverlay = typeof AlertDialogPrimitive.Overlay;
type AlertDialogOverlayProps = ComponentPropsWithoutRef<AlertDialogOverlay>;

const AlertDialogOverlay = forwardRef<ElementRef<AlertDialogOverlay>, AlertDialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "animate-in fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity",
        className
      )}
      {...props}
      ref={ref}
    />
  )
);
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

/*****  CONTENT  *****/
type AlertDialogContent = typeof AlertDialogPrimitive.Content;
type AlertDialogContentProps = ComponentPropsWithoutRef<AlertDialogContent>;

const AlertDialogContent = forwardRef<ElementRef<AlertDialogContent>, AlertDialogContentProps>(
  ({ className, ...props }, ref) => (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          "animate-in fade-in-90 slide-in-from-bottom-10 sm:zoom-in-90 sm:slide-in-from-bottom-0 fixed z-50 grid w-full max-w-lg scale-100 gap-4 bg-white p-6 opacity-100 sm:rounded-lg md:w-full",
          "dark:bg-slate-900",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

/*****  HEADER  *****/
const AlertDialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

/*****  FOOTER  *****/
const AlertDialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

/*****  TITLE  *****/
type AlertDialogTitle = typeof AlertDialogPrimitive.Title;
type AlertDialogTitleProps = ComponentPropsWithoutRef<AlertDialogTitle>;

const AlertDialogTitle = forwardRef<ElementRef<AlertDialogTitle>, AlertDialogTitleProps>(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold text-slate-900", "dark:text-slate-50", className)}
      {...props}
    />
  )
);
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

/*****  DESCRIPTION  *****/
type AlertDialogDescription = typeof AlertDialogPrimitive.Description;
type AlertDialogDescriptionProps = ComponentPropsWithoutRef<AlertDialogDescription>;

const AlertDialogDescription = forwardRef<ElementRef<AlertDialogDescription>, AlertDialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-slate-500", "dark:text-slate-400", className)}
      {...props}
    />
  )
);
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

type AlertDialogAction = typeof AlertDialogPrimitive.Action;
type AlertDialogButtonProps = ComponentPropsWithoutRef<AlertDialogAction>;

const AlertDialogAction = forwardRef<ElementRef<AlertDialogAction>, AlertDialogButtonProps>(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action ref={ref} asChild>
      <Button className={className} {...props}></Button>
    </AlertDialogPrimitive.Action>
  )
);
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

/*****  CANCEL  *****/
const AlertDialogCancel = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Cancel>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} asChild>
    <Button className={className} {...props}></Button>
  </AlertDialogPrimitive.Cancel>
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

AlertDialog.Header = AlertDialogHeader;
AlertDialog.Footer = AlertDialogFooter;
AlertDialog.Title = AlertDialogTitle;
AlertDialog.Description = AlertDialogDescription;
AlertDialog.Action = AlertDialogAction;
AlertDialog.Cancel = AlertDialogCancel;

export { AlertDialog };
