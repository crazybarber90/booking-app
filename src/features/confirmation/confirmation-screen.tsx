"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, parseISO, startOfToday } from "date-fns";

import { useHydrated } from "@/lib/use-hydrated";
import { useBookingStore } from "@/store/booking-store";
import { WizardHeader } from "@/components/layout/wizard-header";
import { ConfirmationView } from "./components/confirmation-view";

/**
 * Pametan container za korak 5 (Confirmation).
 * Čita rezultat rezervacije + izbor iz store-a i iscrtava potvrdu.
 * "GO BACK TO HOMEPAGE" resetuje ceo wizard.
 */
export function ConfirmationScreen() {
  const router = useRouter();
  const hydrated = useHydrated();

  const property = useBookingStore((s) => s.property);
  const dates = useBookingStore((s) => s.dates);
  const cart = useBookingStore((s) => s.cart);
  const guest = useBookingStore((s) => s.guest);
  const booking = useBookingStore((s) => s.booking);
  const reset = useBookingStore((s) => s.reset);

  // Bez uspešne rezervacije nema šta da se prikaže — nazad na početak.
  useEffect(() => {
    if (hydrated && !booking) router.replace("/");
  }, [hydrated, booking, router]);

  const guests = useMemo(
    () =>
      cart.reduce(
        (acc, it) => ({
          adults: acc.adults + it.adults * it.quantity,
          children: acc.children + it.children * it.quantity,
        }),
        { adults: 0, children: 0 }
      ),
    [cart]
  );

  if (!hydrated || !booking || !property || !dates || !guest) return null;

  const handleHome = () => {
    reset();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <WizardHeader current={2} />
      <div className="px-4 py-8 md:px-8">
        <ConfirmationView
          reservationNumber={booking.bookingId}
          daysUntilArrival={Math.max(
            0,
            differenceInCalendarDays(parseISO(dates.checkin), startOfToday())
          )}
          guestName={`${guest.firstName} ${guest.lastName}`}
          email={guest.email}
          phone={guest.phone}
          checkin={dates.checkin}
          checkout={dates.checkout}
          nights={booking.nights}
          hotelName={property.name}
          rooms={cart.map((it) => ({ name: it.unitName }))}
          adults={guests.adults}
          childrenCount={guests.children}
          total={booking.totalPrice}
          onHome={handleHome}
        />
      </div>
    </main>
  );
}
