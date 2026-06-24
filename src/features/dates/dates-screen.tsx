"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHydrated } from "@/lib/use-hydrated";
import {
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfToday,
} from "date-fns";

import { isoDate, type CalendarDay } from "@/types";
import { useBookingStore } from "@/store/booking-store";
import { useCalendar } from "./hooks/use-calendar";
import { DatesPanel } from "./components/dates-panel";

const HERO_IMAGE = "https://picsum.photos/seed/adriatic-coast/1920/1080";

/**
 * Pametan container za korak 2 (Choose Dates).
 * Zna za store (izabrani hotel + upis datuma), API (useCalendar) i drži logiku
 * biranja raspona (checkIn -> checkOut). UI delegira DatesPanel-u.
 */
export function DatesScreen() {
  const router = useRouter();
  const property = useBookingStore((s) => s.property);
  const dates = useBookingStore((s) => s.dates);
  const setDates = useBookingStore((s) => s.setDates);

  // Zustand `persist` čita hotel iz localStorage tek na klijentu. Pre toga (server
  // + prvi render) `property` je null, pa bismo pogrešno redirektovali i dobili
  // hydration mismatch. `useHydrated` vraća true tek posle hidracije → tad je
  // bezbedno proveriti store i, ako hotel ne postoji, vratiti na korak 1.
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !property) router.replace("/");
  }, [hydrated, property, router]);

  const today = startOfToday();

  // Vidljiva su 2 meseca; strelice pomeraju prozor. Ako u store-u već postoje
  // datumi (persist), kreni od meseca check-in-a — inače od tekućeg meseca.
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(dates ? parseISO(dates.checkin) : today)
  );
  const months = useMemo(
    () => [visibleMonth, addMonths(visibleMonth, 1)],
    [visibleMonth]
  );

  // Opseg za API poziv = od početka prvog do kraja drugog meseca.
  const start = isoDate(format(startOfMonth(visibleMonth), "yyyy-MM-dd"));
  const end = isoDate(format(endOfMonth(addMonths(visibleMonth, 1)), "yyyy-MM-dd"));

  const { data, isLoading, isError, error, refetch } = useCalendar(
    property?.id,
    start,
    end
  );

  // Mapa za brz pristup: "YYYY-MM-DD" -> podaci dana.
  const daysMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    data?.days.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  // Selekcija raspona (lokalno; u store ide tek na CONFIRM). Pre-popuni iz
  // store-a da se izbor vidi kad se vratiš na korak 2 (persist čuva store,
  // ali NE lokalno stanje komponente — zato ga ovde čitamo nazad).
  const [checkIn, setCheckIn] = useState<Date | null>(() =>
    dates ? parseISO(dates.checkin) : null
  );
  const [checkOut, setCheckOut] = useState<Date | null>(() =>
    dates ? parseISO(dates.checkout) : null
  );

  const handleSelect = (date: Date) => {
    // Nema check-in, ili su oba već izabrana -> kreni iznova od check-in.
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }
    // Klik pre/na check-in -> pomeri check-in.
    if (isBefore(date, checkIn) || isSameDay(date, checkIn)) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }
    setCheckOut(date);
  };

  const nights =
    checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0;

  const handleConfirm = () => {
    if (!checkIn || !checkOut) return;
    setDates({
      checkin: format(checkIn, "yyyy-MM-dd"),
      checkout: format(checkOut, "yyyy-MM-dd"),
      nights,
    });
    router.push("/rooms"); // korak 3 (izbor sobe)
  };

  // Dok se store ne hidrira (ili ako nema hotela) ne renderuj ništa — guard iznad
  // će redirektovati. Time server i klijent renderuju isto (null) → bez mismatch-a.
  if (!hydrated || !property) return null;

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-xl">
        <DatesPanel
          propertyName={property.name}
          onChangeAccommodation={() => router.push("/")}
          months={months}
          daysMap={daysMap}
          checkIn={checkIn}
          checkOut={checkOut}
          today={today}
          nights={nights}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          canGoPrev={isAfter(startOfMonth(visibleMonth), startOfMonth(today))}
          onPrev={() => setVisibleMonth((m) => addMonths(m, -1))}
          onNext={() => setVisibleMonth((m) => addMonths(m, 1))}
          onSelect={handleSelect}
          onConfirm={handleConfirm}
          onClose={() => router.push("/")}
          onRetry={() => refetch()}
        />
      </div>
    </main>
  );
}
