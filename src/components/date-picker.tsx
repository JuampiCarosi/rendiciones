"use client";

import * as React from "react";
import { addHours, format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Select, SelectContent, SelectValue, SelectItem, SelectTrigger } from "./select";
import type { DateRange } from "react-day-picker";
import { cn } from "../utils/cn";
import { Button } from "./button-shadcn";
import { Calendar } from "./calendar";

export function DatePicker({
  render,
  custom,
  value,
  defaultSide,
  onChange,
  ...calendarProps
}: {
  render?: (date: Date) => string | number | JSX.Element;
  customFormat?: "select" | "buttons";
  custom?: { value: Date; label: string }[];
  value: Date;
  defaultSide?: "calendar" | "custom";
  onChange: (value?: Date) => void;
  fromDate?: Date;
  fromYear?: number;
  toDate?: Date;
  toYear?: number;
}) {
  const [open, setOpen] = React.useState(false);

  const [side, setSide] = React.useState<"calendar" | "custom">(
    defaultSide ?? custom?.find((a) => format(a.value, "yyyy-MM-dd") === format(value, "yyyy-MM-dd"))
      ? "custom"
      : "calendar"
  );

  return (
    <div className="border-slate-150 shadow-slate-150 flex overflow-hidden whitespace-nowrap rounded-md border shadow-sm">
      {custom && (
        <Select
          value={format(value, "yyyy-MM-dd")}
          onValueChange={(value) => {
            setSide("custom");
            onChange(addHours(new Date(value), 3));
          }}
        >
          <SelectTrigger
            className={cn("gap-2 rounded-none border-none shadow-none", { "w-10": side !== "custom" })}
          >
            {side === "custom" && <>{render ? render(value) : <SelectValue placeholder="Elegir" />}</>}
          </SelectTrigger>
          <SelectContent>
            {custom?.map((option, i) => (
              <SelectItem key={i} value={format(option.value, "yyyy-MM-dd")}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start gap-2 rounded-l-none border-0   text-center font-normal shadow-none",
              { "w-34": custom?.length },
              !value && "text-muted-foreground",
              { "w-10": side !== "calendar", "border-l": custom?.length }
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 opacity-75" />
            {side === "calendar" && (
              <>{value ? render ? render(value) : format(value, "dd-MM-yyyy") : <span>Elegir fecha</span>}</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
          <div>
            <Calendar
              modifiersClassNames={{ booked: "!text-red-300 font-semibold !hover:bg-slate-50" }}
              mode="single"
              defaultMonth={value}
              {...calendarProps}
              selected={value}
              onSelect={(value) => {
                setSide("calendar");
                onChange(value);
                setOpen(false);
              }}
            />
          </div>
          <div className="flex flex-row-reverse">
            <Button
              onClick={() => {
                setSide("calendar");
                onChange(new Date());
                setOpen(false);
              }}
              variant="ghost"
            >
              Hoy
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function rangeFormatter(value: DateRange) {
  if (!value.from) {
    return "-";
  }
  return value.to
    ? `${format(value.from, "dd/MM/yyyy")} - ${format(value.to, "dd/MM/yyyy")}`
    : format(value.from, "dd/MM/yyyy");
}

function rangeParser(string: string): CompleteDateRange {
  const [from, to] = string.split(" - ") as [string, string];

  return {
    from: parse(from, "dd/MM/yyyy", new Date()),
    to: parse(to, "dd/MM/yyyy", new Date()),
  };
}

export type CompleteDateRange = {
  from: Date;
  to: Date;
};

export function DateRangePicker({
  render,
  custom,
  value,
  defaultSide,
  onChange,
  ...calendarProps
}: {
  render?: (date: DateRange) => string | number | JSX.Element;
  customFormat?: "select" | "buttons";
  custom?: { value: DateRange; label: string }[];
  value: DateRange;
  defaultSide?: "calendar" | "custom";
  onChange: (value?: CompleteDateRange) => void;
  fromDate?: Date;
  fromYear?: number;
  toDate?: Date;
  toYear?: number;
}) {
  const [open, setOpen] = React.useState(false);

  const [side, setSide] = React.useState<"calendar" | "custom">(
    defaultSide ??
      custom?.find(
        (a) =>
          (a.value.from ? format(a.value.from, "yyyy-MM-dd") : undefined) ===
            (value.from ? format(value.from, "yyyy-MM-dd") : undefined) &&
          (a.value.to ? format(a.value.to, "yyyy-MM-dd") : undefined) ===
            (value.to ? format(value.to, "yyyy-MM-dd") : undefined)
      )
      ? "custom"
      : "calendar"
  );

  return (
    <div className="border-slate-150 shadow-slate-150 flex overflow-hidden whitespace-nowrap rounded-md border shadow-sm">
      {custom && (
        <Select
          value={rangeFormatter(value)}
          onValueChange={(value) => {
            setSide("custom");
            onChange(rangeParser(value));
          }}
        >
          <SelectTrigger
            className={cn("gap-2 rounded-none border-none shadow-none", { "w-10": side !== "custom" })}
          >
            {side === "custom" && <>{render ? render(value) : <SelectValue placeholder="Elegir" />}</>}
          </SelectTrigger>
          <SelectContent>
            {custom?.map((option, i) => (
              <SelectItem key={i} value={rangeFormatter(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-34 justify-start gap-2 rounded-l-none border-0  text-left font-normal shadow-none",
              !value && "text-muted-foreground",
              { "w-10": side !== "calendar", "border-l": custom?.length }
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 opacity-75" />
            {side === "calendar" && (
              <>{value.from ? render ? render(value) : rangeFormatter(value) : <span>Elegir fecha</span>}</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="flex w-auto flex-col space-y-2 p-2">
          <div>
            <Calendar
              modifiersClassNames={{
                booked: "!text-red-300 font-semibold !hover:bg-slate-50",
                // outside: "outside !text-white !bg-white rounded-none cursor-default",
                outside: "outside invisible",
              }}
              mode="range"
              defaultMonth={value.from}
              numberOfMonths={2}
              initialFocus
              {...calendarProps}
              selected={value}
              onSelect={(newValue) => {
                setSide("calendar");
                onChange(
                  !newValue?.from
                    ? { from: value.from as Date, to: value.from as Date }
                    : !newValue.to
                    ? { from: newValue.from, to: newValue.from }
                    : (newValue as CompleteDateRange)
                );
                // setOpen(false);
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
