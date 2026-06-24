import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingResponse, Guest, Property } from "@/types";

/** Izbor datuma iz koraka 2 (vrednosti su `YYYY-MM-DD`). */
export interface DateSelection {
  checkin: string;
  checkout: string;
  nights: number;
}

/**
 * Jedna stavka korpe iz koraka 3.
 * `unitId/rateId/quantity` idu na API (POST /bookings). Ostalo je denormalizovan
 * prikaz (ime, cena, gosti) za summary/confirmation — gosti se NE šalju na API
 * (booking ih ne prima), služe samo za prikaz.
 */
export interface CartItem {
  id: string; // lokalni ključ (stabilan za render/remove)
  unitId: string;
  rateId: string;
  quantity: number;
  unitName: string;
  rateName: string;
  boardType: string;
  unitPrice: number; // totalPrice jedne sobe za ceo boravak
  adults: number;
  children: number;
}

/**
 * Globalni store booking wizard-a. Čuva SAMO korisnikove odluke koje putuju
 * kroz korake (NE serverske podatke — to drži React Query).
 * `persist` → izbor preživi refresh stranice.
 */
interface BookingState {
  property: Property | null;
  dates: DateSelection | null;
  cart: CartItem[];
  /** Podaci gosta iz koraka 4 (za prikaz na confirmation). Bez kartice! */
  guest: Guest | null;
  /** Rezultat uspešne rezervacije iz koraka 4 (broj rezervacije, total...). */
  booking: BookingResponse | null;

  setProperty: (property: Property) => void;
  setDates: (dates: DateSelection) => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  updateCartItem: (id: string, patch: Partial<CartItem>) => void;
  removeCartItem: (id: string) => void;
  setGuest: (guest: Guest) => void;
  setBooking: (booking: BookingResponse) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      property: null,
      dates: null,
      cart: [],
      guest: null,
      booking: null,

      // Korak 1: upiše hotel. Menjanje hotela poništava datume i korpu
      // (drugi hotel = druge sobe i cene).
      setProperty: (property) => set({ property, dates: null, cart: [] }),

      // Korak 2: upiše datume. Korpu poništavamo SAMO ako su se datumi stvarno
      // promenili (druge cene) — ponovna potvrda istih datuma ne dira korpu.
      setDates: (dates) =>
        set((s) => {
          const changed =
            !s.dates ||
            s.dates.checkin !== dates.checkin ||
            s.dates.checkout !== dates.checkout;
          return { dates, cart: changed ? [] : s.cart };
        }),

      // Korak 3: dodaj sobu u korpu (sa generisanim lokalnim id-jem).
      addToCart: (item) =>
        set((s) => ({
          cart: [...s.cart, { ...item, id: crypto.randomUUID() }],
        })),

      // Korak 3: izmeni stavku korpe (quantity / broj gostiju).
      updateCartItem: (id, patch) =>
        set((s) => ({
          cart: s.cart.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),

      // Korak 3: izbaci sobu iz korpe.
      removeCartItem: (id) =>
        set((s) => ({ cart: s.cart.filter((it) => it.id !== id) })),

      // Korak 4: upiše podatke gosta (za prikaz na confirmation).
      setGuest: (guest) => set({ guest }),

      // Korak 4: upiše rezultat uspešne rezervacije.
      setBooking: (booking) => set({ booking }),

      // Reset celog wizard-a (poziva se sa confirmation "GO BACK TO HOMEPAGE").
      reset: () =>
        set({
          property: null,
          dates: null,
          cart: [],
          guest: null,
          booking: null,
        }),
    }),
    { name: "booking-store" }
  )
);
