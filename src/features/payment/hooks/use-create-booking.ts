"use client";

import { useMutation } from "@tanstack/react-query";
import { postBooking } from "@/lib/api";
import type { BookingRequest, BookingResponse } from "@/types";

/**
 * Kreiranje rezervacije (POST /bookings). Mutation jer MENJA stanje na serveru.
 * `isPending` koristimo za loading na dugmetu (blokira dupli klik),
 * `onError`/`error` za prikaz greške.
 */
export function useCreateBooking() {
  return useMutation<BookingResponse, Error, BookingRequest>({
    mutationFn: postBooking,
  });
}
