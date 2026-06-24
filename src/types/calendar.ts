/**
 * Calendar domen — korak 1 (bojenje kalendara po dostupnosti i ceni).
 *
 *  GET /properties/{propertyId}/calendar?start&end -> CalendarResponse
 */

import type { IsoDate, PropertyId } from "./common";

/** Query parametri za calendar poziv. `end` mora biti `>= start`. */
export interface CalendarQuery {
  readonly start: IsoDate;
  readonly end: IsoDate;
}

/** Jedan dan u kalendaru. */
export interface CalendarDay {
  readonly date: IsoDate;
  readonly available: boolean;
  /** Najniža noćna cena preko svih dostupnih jedinica; `null` ako nedostupno. */
  readonly rateFromValue: number | null;
}

/** Response `GET /properties/{id}/calendar`. */
export interface CalendarResponse {
  readonly propertyId: PropertyId;
  readonly days: readonly CalendarDay[];
}
