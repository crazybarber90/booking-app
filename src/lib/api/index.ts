/**
 * Unifikovan API sloj. Sve API funkcije i klijent se izvoze odavde:
 *
 *   import { getProperties, ApiError } from "@/lib/api";
 *
 * Po domenu: properties (calendar, availability, bookings dolaze po koraku).
 */
export { apiClient, ApiError } from "./client";
export * from "./properties";
export * from "./calendar";
export * from "./availability";
export * from "./bookings";
