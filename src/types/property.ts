/**
 * Properties domen — korak 1 (lista hotela) i korak 2 (jedinice hotela).
 *
 *  GET /properties                        -> PropertyListResponse
 *  GET /properties/{propertyId}/units     -> UnitListResponse
 */

import type { Occupancy, PropertyId, UnitId } from "./common";

/** Tip objekta. `string` fallback jer API nije zaključao enum. */
export type PropertyType = "hotel" | "apartment" | "villa" | (string & {});

/** Jedan objekat iz liste (`GET /properties`). */
export interface Property {
  readonly id: PropertyId;
  readonly name: string;
  readonly type: PropertyType;
}

/** Response `GET /properties`. */
export interface PropertyListResponse {
  readonly properties: readonly Property[];
}

/** Smeštajna jedinica (`GET /properties/{id}/units`). */
export interface Unit {
  readonly id: UnitId;
  readonly name: string;
  readonly occupancy: Occupancy;
  readonly image: string;
}

/** Response `GET /properties/{id}/units`. */
export interface UnitListResponse {
  readonly propertyId: PropertyId;
  readonly units: readonly Unit[];
}
