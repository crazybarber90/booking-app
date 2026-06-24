import { apiClient } from "./client";
import type { BookingRequest, BookingResponse } from "@/types";

/**
 * POST /bookings — kreira rezervaciju (korak 4→5). Ovo MENJA stanje na serveru
 * (smanjuje dostupnost) → koristi se kao `useMutation`, ne `useQuery`.
 * Vraća 201 sa `bookingId`, `status`, `totalPrice`.
 */
export async function postBooking(
  body: BookingRequest
): Promise<BookingResponse> {
  const { data } = await apiClient.post<BookingResponse>("/bookings", body);
  return data;
}
