"use client";

import { useQuery } from "@tanstack/react-query";
import { postAvailability } from "@/lib/api";
import { isoDate, type PropertyId } from "@/types";

/**
 * Slobodne jedinice + rate planovi za boravak. Endpoint je POST, ali samo čita
 * (idempotentno) → koristimo `useQuery`, ne `useMutation`. `enabled` čeka hotel
 * i datume; `queryKey` sadrži datume → promena datuma povlači nove cene.
 */
export function useAvailability(
  propertyId: PropertyId | undefined,
  checkin: string | undefined,
  nights: number | undefined
) {
  return useQuery({
    queryKey: ["availability", propertyId, checkin, nights],
    queryFn: () =>
      postAvailability(propertyId as PropertyId, {
        checkin: isoDate(checkin as string),
        nights: nights as number,
      }),
    enabled: Boolean(propertyId && checkin && nights),
  });
}
