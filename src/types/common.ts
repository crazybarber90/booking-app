/**
 * Deljeni primitivi za ceo API sloj.
 *
 * - Branded tipovi (nominalni): sprečavaju da slučajno zameniš `PropertyId` i
 *   `UnitId` — oba su `string` u runtime-u, ali ih TS tretira kao različite.
 * - `IsoDate`: string oblika `YYYY-MM-DD`. Brand garantuje da je prošao kroz
 *   validaciju (vidi `isoDate()` helper), a ne bilo koji string.
 */

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

/** 32-char hex hash, npr. `606c1c1d08b277ec3642270724c7612f`. */
export type PropertyId = Brand<string, "PropertyId">;
/** Identifikator smeštajne jedinice, npr. `201`. */
export type UnitId = Brand<string, "UnitId">;
/** Identifikator rate plana, npr. `2001`. */
export type RateId = Brand<string, "RateId">;
/** UUID rezervacije, npr. `9345d19c-9de3-413e-b2da-98cb0e5ff480`. */
export type BookingId = Brand<string, "BookingId">;
/** ISO datum `YYYY-MM-DD`. */
export type IsoDate = Brand<string, "IsoDate">;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Type guard: da li je string validan `YYYY-MM-DD`. */
export function isIsoDate(value: string): value is IsoDate {
  return ISO_DATE_RE.test(value);
}

/**
 * Pravi `IsoDate` iz stringa uz validaciju. Baca ako format ne valja —
 * koristi za vrednosti koje ulaze u API pozive (fail-fast).
 */
export function isoDate(value: string): IsoDate {
  if (!isIsoDate(value)) {
    throw new RangeError(`Nevalidan ISO datum (očekivano YYYY-MM-DD): "${value}"`);
  }
  return value;
}

/**
 * Bez-provere cast u branded tip. Koristi SAMO za vrednosti koje već stižu iz
 * poverljivog izvora (npr. API response koji je prošao kroz tipiziran klijent).
 */
export const asPropertyId = (v: string) => v as PropertyId;
export const asUnitId = (v: string) => v as UnitId;
export const asRateId = (v: string) => v as RateId;

/** Inkluzivni opseg broja gostiju koje jedinica prima. */
export interface Occupancy {
  readonly min: number;
  readonly max: number;
}
