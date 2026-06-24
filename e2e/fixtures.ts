import type { Page } from "@playwright/test";

/**
 * Mock podaci + presretanje API-ja za E2E.
 * Oblici 1:1 prate ENDPOINTS.md. Playwright presreće svaki API zahtev (ruta
 * "/api/...") u browseru pre nego što ode na Next server, pa test ne zavisi od
 * živog API-ja.
 */

export const PROPERTY = {
  id: "7b3a9f2e4c1d5a8e9f0b6c7d8e9f0a1b",
  name: "Hotel Centar Zagreb",
  type: "hotel",
};

const UNITS = {
  propertyId: PROPERTY.id,
  units: [
    {
      id: "201",
      name: "Deluxe Double",
      occupancy: { min: 1, max: 2 },
      image: "https://picsum.photos/seed/deluxe/600/400",
    },
  ],
};

const AVAILABILITY = {
  propertyId: PROPERTY.id,
  checkin: "2026-06-24",
  nights: 4,
  units: [
    {
      unitId: "201",
      unitsAvailable: 5,
      occupancy: { min: 1, max: 2 },
      rates: [
        {
          rateId: "2001",
          rateName: "Bed & Breakfast",
          boardType: "BB",
          pricePerNight: 120,
          totalPrice: 480,
          breakdown: [{ date: "2026-06-24", price: 120 }],
        },
      ],
    },
  ],
};

export const BOOKING = {
  bookingId: "9345d19c-9de3-413e-b2da-98cb0e5ff480",
  status: "confirmed",
  totalPrice: 480,
  checkin: "2026-06-24",
  nights: 4,
};

/** Svi dani u opsegu [start, end] su dostupni sa cenom (da kalendar bude klikabilan). */
function makeDays(start: string, end: string) {
  const days: { date: string; available: boolean; rateFromValue: number }[] = [];
  const d = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (d <= last) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    days.push({ date: iso, available: true, rateFromValue: 100 });
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/** Postavi sve mock rute na stranici. Pozvati pre `page.goto`. */
export async function mockApi(page: Page) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith("/api/properties")) {
      return route.fulfill({ json: { properties: [PROPERTY] } });
    }
    if (/\/api\/properties\/[^/]+\/units$/.test(path)) {
      return route.fulfill({ json: UNITS });
    }
    if (/\/api\/properties\/[^/]+\/calendar$/.test(path)) {
      const start = url.searchParams.get("start")!;
      const end = url.searchParams.get("end")!;
      return route.fulfill({
        json: { propertyId: PROPERTY.id, days: makeDays(start, end) },
      });
    }
    if (/\/api\/properties\/[^/]+\/availability$/.test(path)) {
      return route.fulfill({ json: AVAILABILITY });
    }
    if (path.endsWith("/api/bookings")) {
      return route.fulfill({ status: 201, json: BOOKING });
    }
    // Sve neočekivano → eksplicitna greška (lakši debug ako fali mock).
    return route.fulfill({
      status: 404,
      json: { error: "not_found", message: `Nema mocka za ${path}` },
    });
  });
}
