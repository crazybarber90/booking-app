"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useHydrated } from "@/lib/use-hydrated";
import { useBookingStore } from "@/store/booking-store";
import { WizardHeader } from "@/components/layout/wizard-header";
import { asRateId, asUnitId, isoDate, type BookingRequest } from "@/types";
import { useCreateBooking } from "./hooks/use-create-booking";
import { PaymentForm } from "./components/payment-form";
import { ReservationSummary } from "./components/reservation-summary";
import type { PaymentFormValues } from "./zod-schema";

/**
 * Pametan container za korak 4 (Payment).
 * Sastavlja BookingRequest iz store-a + forme, šalje POST /bookings (mutation),
 * na uspeh upiše gosta i rezultat pa vodi na confirmation.
 */
export function PaymentScreen() {
  const router = useRouter();
  const hydrated = useHydrated();

  const property = useBookingStore((s) => s.property);
  const dates = useBookingStore((s) => s.dates);
  const cart = useBookingStore((s) => s.cart);
  const setGuest = useBookingStore((s) => s.setGuest);
  const setBooking = useBookingStore((s) => s.setBooking);

  // Guard: nazad na prvi nedostajući korak.
  useEffect(() => {
    if (!hydrated) return;
    if (!property) router.replace("/");
    else if (!dates) router.replace("/dates");
    else if (cart.length === 0) router.replace("/rooms");
  }, [hydrated, property, dates, cart, router]);

  const total = useMemo(
    () => cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
    [cart]
  );

  const { mutate, isPending, error, isError } = useCreateBooking();

  const handleSubmit = (values: PaymentFormValues) => {
    if (!property || !dates) return;

    const guest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: `${values.countryCode} ${values.phone}`,
    };

    const body: BookingRequest = {
      propertyId: property.id,
      checkin: isoDate(dates.checkin),
      nights: dates.nights,
      units: cart.map((it) => ({
        unitId: asUnitId(it.unitId),
        rateId: asRateId(it.rateId),
        quantity: it.quantity,
      })),
      guest,
      // ⚠️ DEV-ONLY mock payment (razmaci očišćeni iz broja kartice).
      payment: {
        cardNumber: values.cardNumber.replace(/\s/g, ""),
        cvv: values.cvv,
        expiration: values.expiration,
        holderFirst: values.holderFirst,
        holderLast: values.holderLast,
      },
    };

    mutate(body, {
      onSuccess: (data) => {
        setGuest(guest); // za prikaz na confirmation
        setBooking(data); // broj rezervacije + total
        router.push("/confirmation");
      },
      onError: (err) => {
        toast.error("Rezervacija nije uspela", { description: err.message });
      },
    });
  };

  if (!hydrated || !property || !dates || cart.length === 0) return null;

  return (
    <main className="min-h-screen bg-background">
      <WizardHeader current={1} onBack={() => router.push("/rooms")} />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section>
            <h1 className="mb-6 font-heading text-3xl">Payment</h1>
            <PaymentForm
              onSubmit={handleSubmit}
              isSubmitting={isPending}
              errorMessage={isError ? error?.message : undefined}
            />
          </section>

          <aside className="h-fit lg:sticky lg:top-8">
            <ReservationSummary
              propertyName={property.name}
              checkin={dates.checkin}
              checkout={dates.checkout}
              nights={dates.nights}
              items={cart}
              total={total}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
