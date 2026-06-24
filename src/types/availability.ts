/**
 * Availability domen — korak 1→2 (slobodne jedinice + rate planovi za boravak).
 *
 *  POST /properties/{propertyId}/availability
 *    body:     AvailabilityRequest
 *    response: AvailabilityResponse
 */

/* readonly označava nepromenljiva polja u
  ▎ compile-time-u; koristim ga na API modelima da kod ne može
  ▎ slučajno da menja podatke koje je server vratio.
*/

import type { IsoDate, Occupancy, PropertyId, RateId, UnitId } from './common'

/** Tip pansiona. `string` fallback za buduće kodove. */
export type BoardType =
  | 'RO' // Room Only
  | 'BB' // Bed & Breakfast
  | 'HB' // Half Board
  | 'FB' // Full Board
  | 'AI' // All Inclusive
  | (string & {})

/** Body `POST /properties/{id}/availability`. */
export interface AvailabilityRequest {
  readonly checkin: IsoDate
  /** Broj noćenja, `1..60`. */
  readonly nights: number
}

/** Cena za jedan dan boravka unutar rate plana. */
export interface RateBreakdownDay {
  readonly date: IsoDate
  readonly price: number
}

/** Jedan rate plan dostupan za jedinicu. */
export interface AvailableRate {
  readonly rateId: RateId
  readonly rateName: string
  readonly boardType: BoardType
  readonly pricePerNight: number
  readonly totalPrice: number
  readonly breakdown: readonly RateBreakdownDay[]
}

/** Jedinica koja ima inventar za sve noći boravka. */
export interface AvailableUnit {
  readonly unitId: UnitId
  readonly unitsAvailable: number
  readonly occupancy: Occupancy
  readonly rates: readonly AvailableRate[]
}

/** Response `POST /properties/{id}/availability`. */
export interface AvailabilityResponse {
  readonly propertyId: PropertyId
  readonly checkin: IsoDate
  readonly nights: number
  readonly units: readonly AvailableUnit[]
}
