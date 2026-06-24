/**
 * Bookings domen — korak 3→4 (kreiranje rezervacije).
 *
 *  POST /bookings
 *    body:     BookingRequest
 *    response: BookingResponse (201)
 *
 * ⚠️ `Payment` prima SIROVE podatke kartice — DEV-ONLY. U produkciji se menja
 *    tokenizovanim payment-om (Stripe payment_intent_id, Adyen reference...).
 *    U ovom zadatku payment je mock/simulacija (vidi CLAUDE.md).
 */

import type { BookingId, IsoDate, PropertyId, RateId, UnitId } from "./common";

/** Izbor jedne jedinice + rate plana u rezervaciji. */
export interface BookingUnitSelection {
  readonly unitId: UnitId;
  readonly rateId: RateId;
  /** Broj jedinica; `>= 1`, default `1`. */
  readonly quantity?: number;
}

/** Podaci gosta. */
export interface Guest {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
}

/** ⚠️ DEV-ONLY: sirovi podaci kartice. Ne logovati, ne perzistirati. */
export interface Payment {
  /** `^\d{12,19}$` */
  readonly cardNumber: string;
  /** `^\d{3,4}$` */
  readonly cvv: string;
  /** `MM/YY`, regex `^(0[1-9]|1[0-2])\/\d{2}$` */
  readonly expiration: string;
  readonly holderFirst: string;
  readonly holderLast: string;
}

/** Body `POST /bookings`. */
export interface BookingRequest {
  readonly propertyId: PropertyId;
  readonly checkin: IsoDate;
  /** `1..60` */
  readonly nights: number;
  /** Najmanje jedna stavka. */
  readonly units: readonly BookingUnitSelection[];
  readonly guest: Guest;
  readonly payment: Payment;
}

/** Status rezervacije. `string` fallback za buduće statuse. */
export type BookingStatus = "confirmed" | (string & {});

/** Response `POST /bookings` (201). */
export interface BookingResponse {
  readonly bookingId: BookingId;
  readonly status: BookingStatus;
  readonly totalPrice: number;
  readonly checkin: IsoDate;
  readonly nights: number;
}
