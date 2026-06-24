# ENDPOINTS.md — Booking API

Izvor: **OpenAPI 3.0.0** spec sa `https://test-booking-api.bid.workers.dev/openapi.json`
(Swagger UI: `/docs`). Primeri u dokumentu su **stvarni response-i** dobijeni pozivanjem
live API-ja (ne samo schema example vrednosti).

- **Base URL (prod):** `https://test-booking-api.bid.workers.dev`
- **Base URL (local dev):** `http://localhost:8787`
- **Format:** sve je `application/json`.
- U `.env.local`: `NEXT_PUBLIC_API_URL=https://test-booking-api.bid.workers.dev`

## Pregled endpointa

| #   | Endpoint                                | Metoda | Tag          | Korak (flow) | Svrha                                       |
| --- | --------------------------------------- | ------ | ------------ | ------------ | ------------------------------------------- |
| 1   | `/properties`                           | GET    | Properties   | 1            | Lista svih hotela/objekata                  |
| 2   | `/properties/{propertyId}/units`        | GET    | Properties   | 2            | Sve smeštajne jedinice objekta              |
| 3   | `/properties/{propertyId}/calendar`     | GET    | Calendar     | 1            | Dostupnost + najniža cena po danu           |
| 4   | `/properties/{propertyId}/availability` | POST   | Availability | 1→2          | Slobodne jedinice + rate planovi za boravak |
| 5   | `/bookings`                             | POST   | Bookings     | 3→4          | Kreiranje rezervacije                       |

> ⚠️ **Payment je DEV-ONLY.** `payment` blok prima sirove podatke kartice (PAN/CVV).
> Samo za lokalno testiranje — u produkciji ide tokenizovan payment (Stripe `payment_intent_id`,
> Adyen reference...). U ovom zadatku payment je **mock/simulacija** (vidi CLAUDE.md).

---

## 1. GET `/properties`

Vraća `id`, `name` i `type` za svaki objekat.

**Parametri:** nema.

### 200 — List of properties (`PropertyListResponse`)

Stvarni response:

```json
{
  "properties": [
    {
      "id": "7b3a9f2e4c1d5a8e9f0b6c7d8e9f0a1b",
      "name": "Hotel Centar Zagreb",
      "type": "hotel"
    },
    {
      "id": "a1b2c3d4e5f60718293a4b5c6d7e8f90",
      "name": "Plitvice Lodge",
      "type": "apartment"
    },
    {
      "id": "606c1c1d08b277ec3642270724c7612f",
      "name": "Seaside Villa Split",
      "type": "villa"
    }
  ]
}
```

### 500 — Server error (`ErrorResponse`)

```json
{ "error": "server_error", "message": "..." }
```

---

## 2. GET `/properties/{propertyId}/units`

Vraća svaku jedinicu objekta — `id`, `name`, `occupancy` (min/max) i `image`.

**Path parametri:**

| Param        | Tip    | Obavezno | Opis             |
| ------------ | ------ | -------- | ---------------- |
| `propertyId` | string | da       | 32-char hex hash |

### 200 — List of units (`UnitListResponse`)

Stvarni response (Hotel Centar Zagreb):

```json
{
  "propertyId": "7b3a9f2e4c1d5a8e9f0b6c7d8e9f0a1b",
  "units": [
    {
      "id": "201",
      "name": "Deluxe Double",
      "occupancy": { "min": 1, "max": 2 },
      "image": "https://picsum.photos/seed/deluxe/600/400"
    },
    {
      "id": "203",
      "name": "Junior Suite",
      "occupancy": { "min": 1, "max": 3 },
      "image": "https://picsum.photos/seed/junior/600/400"
    },
    {
      "id": "204",
      "name": "Presidential Suite",
      "occupancy": { "min": 1, "max": 4 },
      "image": "https://picsum.photos/seed/pres/600/400"
    },
    {
      "id": "202",
      "name": "Standard Twin",
      "occupancy": { "min": 1, "max": 2 },
      "image": "https://picsum.photos/seed/twin/600/400"
    }
  ]
}
```

### 404 — Property not found (`ErrorResponse`)

Stvarni response:

```json
{ "error": "not_found", "message": "Property not found" }
```

### 500 — Server error (`ErrorResponse`)

```json
{ "error": "server_error", "message": "..." }
```

---

## 3. GET `/properties/{propertyId}/calendar`

Jedan red po danu u opsegu `[start, end]`. `available` je `true` ako bilo koja jedinica
objekta ima inventar tog dana. `rateFromValue` je najjeftinija noćna cena preko svih
dostupnih jedinica tog dana (`null` ako nijedna nije dostupna).

**Path parametri:**

| Param        | Tip    | Obavezno | Opis             |
| ------------ | ------ | -------- | ---------------- |
| `propertyId` | string | da       | 32-char hex hash |

**Query parametri:**

| Param   | Tip    | Obavezno | Opis                                          |
| ------- | ------ | -------- | --------------------------------------------- |
| `start` | string | da       | ISO datum `YYYY-MM-DD`                        |
| `end`   | string | da       | ISO datum `YYYY-MM-DD` (mora biti `>= start`) |

Primer: `GET /properties/{propertyId}/calendar?start=2026-07-01&end=2026-07-03`

### 200 — Day-by-day availability (`CalendarResponse`)

Stvarni response:

```json
{
  "propertyId": "7b3a9f2e4c1d5a8e9f0b6c7d8e9f0a1b",
  "days": [
    { "date": "2026-07-01", "available": true, "rateFromValue": 80 },
    { "date": "2026-07-02", "available": true, "rateFromValue": 80 },
    { "date": "2026-07-03", "available": true, "rateFromValue": 80 }
  ]
}
```

> `rateFromValue` je `number | null` — `null` kad nema dostupnosti tog dana.

### 400 — Bad request (npr. `end` pre `start`) (`ErrorResponse`)

Stvarni response:

```json
{ "error": "bad_request", "message": "end must be >= start" }
```

### 404 — Property not found (`ErrorResponse`)

```json
{ "error": "not_found", "message": "Property not found" }
```

### 500 — Server error (`ErrorResponse`)

```json
{ "error": "server_error", "message": "..." }
```

---

## 4. POST `/properties/{propertyId}/availability`

Za dati `checkin` i broj `nights` vraća svaku jedinicu objekta koja ima inventar za
**sve** noći boravka, zajedno sa svim rate planovima za tu jedinicu. Svaki rate ima
`breakdown` (cena po danu).

**Path parametri:**

| Param        | Tip    | Obavezno | Opis             |
| ------------ | ------ | -------- | ---------------- |
| `propertyId` | string | da       | 32-char hex hash |

**Request body (`AvailabilityRequest`):**

| Polje     | Tip     | Obavezno | Pravila                |
| --------- | ------- | -------- | ---------------------- |
| `checkin` | string  | da       | ISO datum `YYYY-MM-DD` |
| `nights`  | integer | da       | `1 ≤ nights ≤ 60`      |

```json
{ "checkin": "2026-07-01", "nights": 3 }
```

### 200 — Bookable units and rates (`AvailabilityResponse`)

Stvarni response (skraćen na 2 jedinice radi čitljivosti — API vraća sve):

```json
{
  "propertyId": "7b3a9f2e4c1d5a8e9f0b6c7d8e9f0a1b",
  "checkin": "2026-07-01",
  "nights": 3,
  "units": [
    {
      "unitId": "201",
      "unitsAvailable": 10,
      "occupancy": { "min": 1, "max": 2 },
      "rates": [
        {
          "rateId": "2001",
          "rateName": "Bed & Breakfast",
          "boardType": "BB",
          "pricePerNight": 120,
          "totalPrice": 360,
          "breakdown": [
            { "date": "2026-07-01", "price": 120 },
            { "date": "2026-07-02", "price": 120 },
            { "date": "2026-07-03", "price": 120 }
          ]
        },
        {
          "rateId": "2002",
          "rateName": "Half Board",
          "boardType": "HB",
          "pricePerNight": 150,
          "totalPrice": 450,
          "breakdown": [
            { "date": "2026-07-01", "price": 150 },
            { "date": "2026-07-02", "price": 150 },
            { "date": "2026-07-03", "price": 150 }
          ]
        },
        {
          "rateId": "2003",
          "rateName": "Bed & Breakfast Non-Refundable",
          "boardType": "BB",
          "pricePerNight": 99,
          "totalPrice": 297,
          "breakdown": [
            { "date": "2026-07-01", "price": 99 },
            { "date": "2026-07-02", "price": 99 },
            { "date": "2026-07-03", "price": 99 }
          ]
        }
      ]
    },
    {
      "unitId": "204",
      "unitsAvailable": 1,
      "occupancy": { "min": 1, "max": 4 },
      "rates": [
        {
          "rateId": "2031",
          "rateName": "Bed & Breakfast",
          "boardType": "BB",
          "pricePerNight": 550,
          "totalPrice": 1650,
          "breakdown": [
            { "date": "2026-07-01", "price": 550 },
            { "date": "2026-07-02", "price": 550 },
            { "date": "2026-07-03", "price": 550 }
          ]
        },
        {
          "rateId": "2032",
          "rateName": "All Inclusive",
          "boardType": "AI",
          "pricePerNight": 720,
          "totalPrice": 2160,
          "breakdown": [
            { "date": "2026-07-01", "price": 720 },
            { "date": "2026-07-02", "price": 720 },
            { "date": "2026-07-03", "price": 720 }
          ]
        }
      ]
    }
  ]
}
```

> Viđeni `boardType` kodovi: `RO` (Room Only), `BB` (Bed & Breakfast),
> `HB` (Half Board), `FB` (Full Board), `AI` (All Inclusive).

### 400 — Validation error (Zod)

Kada body ne prođe validaciju, API vraća **Zod** oblik greške (NIJE `ErrorResponse`):

```json
{
  "success": false,
  "error": {
    "name": "ZodError",
    "message": "[ { \"code\": \"invalid_format\", \"path\": [\"checkin\"], \"message\": \"YYYY-MM-DD\" }, { \"code\": \"too_small\", \"minimum\": 1, \"path\": [\"nights\"], \"message\": \"Too small: expected number to be >=1\" } ]"
  }
}
```

> ⚠️ Validacione greške (Zod) dolaze u `{ success, error: { name, message } }` obliku,
> dok logičke greške (not found, server error) dolaze u `{ error, message }` (`ErrorResponse`)
> obliku. Frontend error handler mora da pokrije oba.

### 404 — Property not found (`ErrorResponse`)

```json
{ "error": "not_found", "message": "Property not found" }
```

### 500 — Server error (`ErrorResponse`)

```json
{ "error": "server_error", "message": "..." }
```

---

## 5. POST `/bookings`

Kreira rezervaciju za jednu ili više jedinica objekta. Smanjuje po-noćnu dostupnost
za svaku rezervisanu jedinicu. Vraća `201 Created`.

**Request body (`BookingRequest`):**

| Polje        | Tip     | Obavezno | Pravila                                       |
| ------------ | ------- | -------- | --------------------------------------------- |
| `propertyId` | string  | da       | 32-char hex hash                              |
| `checkin`    | string  | da       | ISO datum `YYYY-MM-DD`                        |
| `nights`     | integer | da       | `1 ≤ nights ≤ 60`                             |
| `units`      | array   | da       | min 1 stavka (`BookingUnitSelection`)         |
| `guest`      | object  | da       | `Guest`                                       |
| `payment`    | object  | da       | `Payment` (⚠️ DEV-ONLY sirovi podaci kartice) |

`BookingUnitSelection`:

| Polje      | Tip     | Obavezno | Pravila                       |
| ---------- | ------- | -------- | ----------------------------- |
| `unitId`   | string  | da       | mora postojati u objektu      |
| `rateId`   | string  | da       | mora postojati za tu jedinicu |
| `quantity` | integer | ne       | `>= 1`, default `1`           |

`Guest`:

| Polje       | Tip    | Obavezno | Pravila      |
| ----------- | ------ | -------- | ------------ |
| `firstName` | string | da       | minLength 1  |
| `lastName`  | string | da       | minLength 1  |
| `email`     | string | da       | format email |
| `phone`     | string | da       | minLength 3  |

`Payment` (⚠️ DEV-ONLY):

| Polje         | Tip    | Obavezno | Pravila                                   |
| ------------- | ------ | -------- | ----------------------------------------- |
| `cardNumber`  | string | da       | regex `^\d{12,19}$`                       |
| `cvv`         | string | da       | regex `^\d{3,4}$`                         |
| `expiration`  | string | da       | regex `^(0[1-9]\|1[0-2])\/\d{2}$` (MM/YY) |
| `holderFirst` | string | da       | minLength 1                               |
| `holderLast`  | string | da       | minLength 1                               |

Primer body-ja:

```json
{
  "propertyId": "7b3a9f2e4c1d5a8e9f0b6c7d8e9f0a1b",
  "checkin": "2026-07-01",
  "nights": 3,
  "units": [{ "unitId": "201", "rateId": "2001", "quantity": 1 }],
  "guest": {
    "firstName": "Ana",
    "lastName": "Anic",
    "email": "ana@example.com",
    "phone": "+385123456"
  },
  "payment": {
    "cardNumber": "4242424242424242",
    "cvv": "123",
    "expiration": "08/27",
    "holderFirst": "Ana",
    "holderLast": "Anic"
  }
}
```

### 201 — Booking created (`BookingResponse`)

Stvarni response:

```json
{
  "bookingId": "9345d19c-9de3-413e-b2da-98cb0e5ff480",
  "status": "confirmed",
  "totalPrice": 360,
  "checkin": "2026-07-01",
  "nights": 3
}
```

### 400 — Validation / availability error (`ErrorResponse`)

Stvarni response (pogrešan `unitId` za objekat):

```json
{
  "error": "bad_request",
  "message": "Unit 101 not in property 7b3a9f2e4c1d5a8e9f0b6c7d8e9f0a1b"
}
```

> Napomena: čisto šema-validacione greške (npr. nevalidan email/kartica) mogu doći
> i u Zod obliku `{ success: false, error: { name: "ZodError", message } }`.

### 404 — Property, unit, or rate not found (`ErrorResponse`)

```json
{ "error": "not_found", "message": "Property not found" }
```

### 500 — Server error (`ErrorResponse`)

```json
{ "error": "server_error", "message": "..." }
```

---

## Schemas (OpenAPI `components.schemas`)

### PropertyListResponse

| Polje        | Tip          | Obavezno |
| ------------ | ------------ | -------- |
| `properties` | `Property[]` | da       |

### Property

| Polje  | Tip    | Obavezno | Napomena                                                               |
| ------ | ------ | -------- | ---------------------------------------------------------------------- |
| `id`   | string | da       | minLength 1, 32-char hex hash, npr. `606c1c1d08b277ec3642270724c7612f` |
| `name` | string | da       | npr. `Seaside Villa Split`                                             |
| `type` | string | da       | npr. `villa`, `hotel`, `apartment`                                     |

### ErrorResponse

| Polje     | Tip    | Obavezno | Napomena                                        |
| --------- | ------ | -------- | ----------------------------------------------- |
| `error`   | string | da       | npr. `not_found`, `bad_request`, `server_error` |
| `message` | string | da       | npr. `Property not found`                       |

### UnitListResponse

| Polje        | Tip      | Obavezno |
| ------------ | -------- | -------- |
| `propertyId` | string   | da       |
| `units`      | `Unit[]` | da       |

### Unit

| Polje           | Tip     | Obavezno | Napomena                         |
| --------------- | ------- | -------- | -------------------------------- |
| `id`            | string  | da       | npr. `101`                       |
| `name`          | string  | da       | npr. `Sea-view Suite`            |
| `occupancy`     | object  | da       | `{ min: integer, max: integer }` |
| `occupancy.min` | integer | da       | npr. `1`                         |
| `occupancy.max` | integer | da       | npr. `4`                         |
| `image`         | string  | da       | URL slike                        |

### CalendarResponse

| Polje        | Tip             | Obavezno |
| ------------ | --------------- | -------- |
| `propertyId` | string          | da       |
| `days`       | `CalendarDay[]` | da       |

### CalendarDay

| Polje           | Tip            | Obavezno | Napomena                                  |
| --------------- | -------------- | -------- | ----------------------------------------- |
| `date`          | string         | da       | `YYYY-MM-DD`                              |
| `available`     | boolean        | da       |                                           |
| `rateFromValue` | number \| null | da       | najniža noćna cena; `null` ako nedostupno |

### AvailabilityRequest

| Polje     | Tip     | Obavezno | Napomena     |
| --------- | ------- | -------- | ------------ |
| `checkin` | string  | da       | `YYYY-MM-DD` |
| `nights`  | integer | da       | `1..60`      |

### AvailabilityResponse

| Polje        | Tip               | Obavezno |
| ------------ | ----------------- | -------- |
| `propertyId` | string            | da       |
| `checkin`    | string            | da       |
| `nights`     | integer           | da       |
| `units`      | `AvailableUnit[]` | da       |

### AvailableUnit

| Polje            | Tip               | Obavezno | Napomena       |
| ---------------- | ----------------- | -------- | -------------- |
| `unitId`         | string            | da       | npr. `101`     |
| `unitsAvailable` | integer           | da       | npr. `2`       |
| `occupancy`      | object            | da       | `{ min, max }` |
| `rates`          | `AvailableRate[]` | da       |                |

### AvailableRate

| Polje           | Tip                  | Obavezno | Napomena                          |
| --------------- | -------------------- | -------- | --------------------------------- |
| `rateId`        | string               | da       | npr. `1001`                       |
| `rateName`      | string               | da       | npr. `Bed & Breakfast`            |
| `boardType`     | string               | da       | npr. `BB`, `HB`, `FB`, `RO`, `AI` |
| `pricePerNight` | number               | da       | npr. `210`                        |
| `totalPrice`    | number               | da       | npr. `630`                        |
| `breakdown`     | `RateBreakdownDay[]` | da       |                                   |

### RateBreakdownDay

| Polje   | Tip    | Obavezno | Napomena     |
| ------- | ------ | -------- | ------------ |
| `date`  | string | da       | `YYYY-MM-DD` |
| `price` | number | da       |              |

### BookingRequest

| Polje        | Tip                      | Obavezno | Napomena         |
| ------------ | ------------------------ | -------- | ---------------- |
| `propertyId` | string                   | da       | 32-char hex hash |
| `checkin`    | string                   | da       | `YYYY-MM-DD`     |
| `nights`     | integer                  | da       | `1..60`          |
| `units`      | `BookingUnitSelection[]` | da       | minItems 1       |
| `guest`      | `Guest`                  | da       |                  |
| `payment`    | `Payment`                | da       | ⚠️ DEV-ONLY      |

### BookingUnitSelection

| Polje      | Tip     | Obavezno | Napomena            |
| ---------- | ------- | -------- | ------------------- |
| `unitId`   | string  | da       |                     |
| `rateId`   | string  | da       |                     |
| `quantity` | integer | ne       | `>= 1`, default `1` |

### Guest

| Polje       | Tip    | Obavezno | Napomena     |
| ----------- | ------ | -------- | ------------ |
| `firstName` | string | da       | minLength 1  |
| `lastName`  | string | da       | minLength 1  |
| `email`     | string | da       | format email |
| `phone`     | string | da       | minLength 3  |

### Payment (⚠️ DEV ONLY — sirovi podaci kartice, ne koristiti u produkciji)

| Polje         | Tip    | Obavezno | Napomena                            |
| ------------- | ------ | -------- | ----------------------------------- |
| `cardNumber`  | string | da       | `^\d{12,19}$`                       |
| `cvv`         | string | da       | `^\d{3,4}$`                         |
| `expiration`  | string | da       | `^(0[1-9]\|1[0-2])\/\d{2}$` (MM/YY) |
| `holderFirst` | string | da       | minLength 1                         |
| `holderLast`  | string | da       | minLength 1                         |

### BookingResponse

| Polje        | Tip     | Obavezno | Napomena         |
| ------------ | ------- | -------- | ---------------- |
| `bookingId`  | string  | da       | UUID             |
| `status`     | string  | da       | npr. `confirmed` |
| `totalPrice` | number  | da       |                  |
| `checkin`    | string  | da       | `YYYY-MM-DD`     |
| `nights`     | integer | da       |                  |

---

## Napomene za frontend (mapiranje na flow)

- **Korak 1 (Choose Accommodation + Dates):** `GET /properties` za listu hotela →
  `GET /properties/{id}/calendar?start&end` za bojenje kalendara (`available`,
  `rateFromValue`).
- **Korak 2 (Choose Room / Cart):** `POST /properties/{id}/availability` sa
  `{ checkin, nights }` → liste jedinica i rate planova; korpa računa `totalPrice`
  iz izabranih `rates`.
- **Korak 3 (Payment):** prikupi `guest` + `payment`; payment je **mock** (vidi CLAUDE.md).
- **Korak 4 (Confirmation):** `POST /bookings` → `bookingId`, `status`, `totalPrice`.

**Error handling — dva oblika grešaka:**

1. `ErrorResponse`: `{ error, message }` — logičke greške (404, 400 logika, 500).
2. `ZodError`: `{ success: false, error: { name: "ZodError", message } }` — schema validacija body-ja.
