import { apiClient } from "./client";
import type {
  AvailabilityRequest,
  AvailabilityResponse,
  PropertyId,
} from "@/types";

/**
 * POST /properties/{id}/availability — slobodne jedinice + rate planovi za
 * boravak (korak 3). Iako je POST, ovo je čitanje (idempotentno) → koristi se
 * kao React Query upit.
 */
export async function postAvailability(
  propertyId: PropertyId,
  body: AvailabilityRequest
): Promise<AvailabilityResponse> {
  const { data } = await apiClient.post<AvailabilityResponse>(
    `/properties/${propertyId}/availability`,
    body
  );
  return data;
}
