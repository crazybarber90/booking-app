import {
  format,
  getDaysInMonth,
  getDay,
  isBefore,
  isSameDay,
  startOfMonth,
} from "date-fns";

import type { CalendarDay as CalendarDayData } from "@/types";
import { CalendarDay } from "./calendar-day";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface MonthCalendarProps {
  /** Bilo koji datum u mesecu koji se prikazuje. */
  month: Date;
  /** Mapa `YYYY-MM-DD` -> podaci dana (dostupnost + cena). */
  daysMap: Map<string, CalendarDayData>;
  checkIn: Date | null;
  checkOut: Date | null;
  /** Današnji dan (dani pre njega su disabled). */
  today: Date;
  onSelect: (date: Date) => void;
}

/**
 * Glupa komponenta: grid jednog meseca. Računa raspored (nedelja počinje
 * ponedeljkom) i za svaki dan vadi stanje iz `daysMap` + selekcije.
 */
export function MonthCalendar({
  month,
  daysMap,
  checkIn,
  checkOut,
  today,
  onSelect,
}: MonthCalendarProps) {
  const first = startOfMonth(month);
  const daysInMonth = getDaysInMonth(month);
  // getDay: 0=Su..6=Sa -> pomeri da ponedeljak bude 0
  const leadingBlanks = (getDay(first) + 6) % 7;

  return (
    <div className="w-full">
      <h3 className="mb-3 text-center font-heading text-base">
        {format(month, "MMMM yyyy")}
      </h3>

      <div className="grid grid-cols-7 gap-x-0 gap-y-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="pb-1 text-center text-xs text-muted-foreground"
          >
            {wd}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const date = new Date(
            month.getFullYear(),
            month.getMonth(),
            dayNum
          );
          const iso = format(date, "yyyy-MM-dd");
          const data = daysMap.get(iso);

          const past = isBefore(date, today);
          const disabled = past || !data?.available;

          const isCheckIn = checkIn ? isSameDay(date, checkIn) : false;
          const isCheckOut = checkOut ? isSameDay(date, checkOut) : false;
          const inRange =
            checkIn && checkOut
              ? isBefore(checkIn, date) && isBefore(date, checkOut)
              : false;

          const selected = isCheckIn || isCheckOut || inRange;
          // Bez check-out-a, check-in je i početak i kraj (pun krug).
          const roundLeft = isCheckIn;
          const roundRight = isCheckOut || (isCheckIn && !checkOut);

          return (
            <CalendarDay
              key={iso}
              day={dayNum}
              price={data?.rateFromValue ?? null}
              disabled={disabled}
              selected={selected}
              roundLeft={roundLeft}
              roundRight={roundRight}
              onSelect={() => onSelect(date)}
            />
          );
        })}
      </div>
    </div>
  );
}
