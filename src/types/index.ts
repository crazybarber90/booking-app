/**
 * Barrel za API tipove. Import iz jednog mesta:
 *
 *   import type { Property, AvailabilityResponse, BookingRequest } from "@/types";
 *   import { isErrorResponse, isoDate } from "@/types";
 *
 * Tipovi 1:1 prate OpenAPI schema-e iz ENDPOINTS.md.
 */

// Primitivi + branded ID-jevi (vrednosni helperi i tipovi)
export * from "./common";

// Greške (oba oblika + type guard-ovi)
export * from "./error";

// Domeni po koraku flow-a
export * from "./property"; // korak 1–2
export * from "./calendar"; // korak 1
export * from "./availability"; // korak 1→2
export * from "./booking"; // korak 3→4
