import { apiClient } from "./client";
import type { Property, PropertyListResponse, PropertyId, UnitListResponse } from "@/types";

/** GET /properties — lista svih hotela (korak 1). */
export async function getProperties(): Promise<readonly Property[]> {
  const { data } = await apiClient.get<PropertyListResponse>("/properties");
  return data.properties;
}

/** GET /properties/{id}/units — jedinice hotela (korak 2). */
export async function getUnits(propertyId: PropertyId): Promise<UnitListResponse> {
  const { data } = await apiClient.get<UnitListResponse>(
    `/properties/${propertyId}/units`
  );
  return data;
}
