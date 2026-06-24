"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WizardHeader } from "@/components/layout/wizard-header";
import { useHydrated } from "@/lib/use-hydrated";
import { useBookingStore } from "@/store/booking-store";
import type { AvailableRate, AvailableUnit } from "@/types";
import { useUnits } from "./hooks/use-units";
import { useAvailability } from "./hooks/use-availability";
import { RoomCard } from "./components/room-card";
import { CartPanel } from "./components/cart-panel";

/**
 * Pametan container za korak 3 (Choose Room / Cart).
 * Spaja /units (ime+slika) i /availability (rate planovi) po unitId, drži korpu
 * u store-u i računa total. UI ide u RoomCard + CartPanel.
 */
export function RoomsScreen() {
  const router = useRouter();
  const hydrated = useHydrated();

  const property = useBookingStore((s) => s.property);
  const dates = useBookingStore((s) => s.dates);
  const cart = useBookingStore((s) => s.cart);
  const addToCart = useBookingStore((s) => s.addToCart);
  const updateCartItem = useBookingStore((s) => s.updateCartItem);
  const removeCartItem = useBookingStore((s) => s.removeCartItem);

  // Guard: nema hotela → korak 1; ima hotel ali nema datuma → korak 2.
  useEffect(() => {
    if (!hydrated) return;
    if (!property) router.replace("/");
    else if (!dates) router.replace("/dates");
  }, [hydrated, property, dates, router]);

  const units = useUnits(property?.id);
  const availability = useAvailability(property?.id, dates?.checkin, dates?.nights);

  // Mapa unitId → {ime, slika} iz /units, za spajanje sa availability.
  const unitInfo = useMemo(() => {
    const map = new Map<string, { name: string; image: string }>();
    units.data?.units.forEach((u) => map.set(u.id, { name: u.name, image: u.image }));
    return map;
  }, [units.data]);

  const total = useMemo(
    () => cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
    [cart]
  );

  // Dostupnost po jedinici (iz availability) i koliko je već u korpi.
  const availMap = useMemo(() => {
    const m = new Map<string, number>();
    availability.data?.units.forEach((u) => m.set(u.unitId, u.unitsAvailable));
    return m;
  }, [availability.data]);

  const bookedPerUnit = useMemo(() => {
    const m = new Map<string, number>();
    cart.forEach((it) => m.set(it.unitId, (m.get(it.unitId) ?? 0) + it.quantity));
    return m;
  }, [cart]);

  // Preostalo slobodnih za datu jedinicu = dostupno − već u korpi.
  const remainingFor = (unitId: string, unitsAvailable: number) =>
    (availMap.get(unitId) ?? unitsAvailable) - (bookedPerUnit.get(unitId) ?? 0);

  // Maks. broj soba po stavci korpe (ne računa samu tu stavku).
  const maxQuantities = useMemo(() => {
    const r: Record<string, number> = {};
    cart.forEach((it) => {
      const avail = availMap.get(it.unitId) ?? it.quantity;
      const others = (bookedPerUnit.get(it.unitId) ?? 0) - it.quantity;
      r[it.id] = Math.max(1, avail - others);
    });
    return r;
  }, [cart, availMap, bookedPerUnit]);

  const isLoading = units.isLoading || availability.isLoading;
  const isError = units.isError || availability.isError;

  const handleSelectRate = (unit: AvailableUnit, rate: AvailableRate) => {
    // Klijent cap: ne dozvoli više soba nego što ih ima (server je i dalje izvor istine).
    if (remainingFor(unit.unitId, unit.unitsAvailable) <= 0) {
      toast.error("Nema više slobodnih soba ovog tipa.");
      return;
    }
    const info = unitInfo.get(unit.unitId);
    addToCart({
      unitId: unit.unitId,
      rateId: rate.rateId,
      quantity: 1,
      unitName: info?.name ?? `Soba ${unit.unitId}`,
      rateName: rate.rateName,
      boardType: rate.boardType,
      unitPrice: rate.totalPrice,
      adults: 2, // gosti su samo za prikaz (API ih ne prima)
      children: 0,
    });
    toast.success("Soba dodata u korpu");
  };

  const handleContinue = () => {
    router.push("/payment"); // korak 4 (plaćanje)
  };

  if (!hydrated || !property || !dates) return null;

  return (
    <main className="min-h-screen bg-muted/30">
      <WizardHeader current={0} onBack={() => router.push("/dates")} />
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <h1 className="mb-6 font-heading text-2xl">{property.name}</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Lista soba */}
          <section className="flex flex-col gap-4">
            {isLoading &&
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-48 w-full" />)}

            {isError && !isLoading && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {availability.error?.message ??
                    units.error?.message ??
                    "Ne mogu da učitam sobe."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    units.refetch();
                    availability.refetch();
                  }}
                >
                  Pokušaj ponovo
                </Button>
              </div>
            )}

            {!isLoading &&
              !isError &&
              availability.data?.units.map((unit) => {
                const info = unitInfo.get(unit.unitId);
                return (
                  <RoomCard
                    key={unit.unitId}
                    unit={unit}
                    name={info?.name ?? `Soba ${unit.unitId}`}
                    image={info?.image ?? "https://picsum.photos/seed/room/600/400"}
                    remaining={remainingFor(unit.unitId, unit.unitsAvailable)}
                    nights={dates.nights}
                    onSelectRate={handleSelectRate}
                  />
                );
              })}
          </section>

          {/* Korpa */}
          <aside className="h-fit lg:sticky lg:top-6">
            <CartPanel
              items={cart}
              total={total}
              maxQuantities={maxQuantities}
              onChangeItem={updateCartItem}
              onRemoveItem={removeCartItem}
              onContinue={handleContinue}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
