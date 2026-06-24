"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types";
import { useBookingStore } from "@/store/booking-store";
import { useProperties } from "./hooks/use-properties";
import { AccommodationPanel } from "./components/accommodation-panel";

// Hero pozadina (coastal). API/dizajn slike su mockup — bilo koja slika je ok.
const HERO_IMAGE = "https://picsum.photos/seed/adriatic-coast/1920/1080";

/**
 * Pametan container za korak 1 (Choose Accommodation).
 * Jedino mesto koje zna za API (useProperties) i store (useBookingStore).
 * UI delegira "glupom" AccommodationPanel-u.
 */
export function AccommodationScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const { data, isLoading, isError, error, refetch } = useProperties();
  const setProperty = useBookingStore((s) => s.setProperty);

  const handleSelect = (property: Property) => {
    setProperty(property); // upiši hotel u store...
    router.push("/dates"); // ...pa na korak 2 (izbor datuma)
  };

  return (
    <main className="relative flex min-h-screen flex-col">
      {/* Hero pozadina */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Kad je modal zatvoren — dugme da se ponovo otvori */}
      {!open && (
        <div className="relative z-10 flex flex-1 items-center justify-center p-4">
          <Button size="lg" onClick={() => setOpen(true)}>
            Izaberi smeštaj
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Accommodation
            </DialogTitle>
          </DialogHeader>
          <AccommodationPanel
            properties={data ?? []}
            isLoading={isLoading}
            isError={isError}
            errorMessage={error?.message}
            onRetry={() => refetch()}
            onSelect={handleSelect}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
