import { apiClient } from "./client";
import type { CalendarResponse, IsoDate, PropertyId } from "@/types";

/**
 * GET /properties/{id}/calendar?start&end — dostupnost + najniža cena po danu
 * (korak 2, bojenje kalendara). `end` mora biti `>= start`.
 */
export async function getCalendar(
  propertyId: PropertyId,
  start: IsoDate,
  end: IsoDate
): Promise<CalendarResponse> {
  const { data } = await apiClient.get<CalendarResponse>(
    `/properties/${propertyId}/calendar`,
    { params: { start, end } }
  );
  return data;
}
