"use client";

import { useQuery } from "@tanstack/react-query";
import { getUnits } from "@/lib/api";
import type { PropertyId } from "@/types";

/**
 * Jedinice hotela (GET /units) — daju ime i sliku sobe, kojih availability nema.
 * U containeru se spaja sa availability po `unitId`.
 */
export function useUnits(propertyId: PropertyId | undefined) {
  return useQuery({
    queryKey: ["units", propertyId],
    queryFn: () => getUnits(propertyId as PropertyId),
    enabled: Boolean(propertyId),
  });
}
