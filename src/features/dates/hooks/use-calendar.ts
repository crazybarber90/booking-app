"use client";

import { useQuery } from "@tanstack/react-query";
import { getCalendar } from "@/lib/api";
import type { IsoDate, PropertyId } from "@/types";

/**
 * React Query hook za kalendar (GET /calendar) izabranog hotela u opsegu
 * [start, end]. `enabled` čeka da hotel postoji. Ključ sadrži opseg → promena
 * meseca automatski povlači nove podatke (i kešira po opsegu).
 */
export function useCalendar(
  propertyId: PropertyId | undefined,
  start: IsoDate,
  end: IsoDate
) {
  return useQuery({
    queryKey: ["calendar", propertyId, start, end],
    queryFn: () => getCalendar(propertyId as PropertyId, start, end),
    enabled: Boolean(propertyId),
  });
}
