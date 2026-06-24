# TESTS.md — Testovi

Cilj: **ciljano testirati najrizičnije delove**, ne juriti coverage broj. Pokriveni
su: payment logika (Luhn/expiry/brend), kaskadna logika store-a, normalizacija API
grešaka i **jedan E2E happy-path** kroz ceo flow. Senior pristup = manje testova, ali
na pravim mestima.

## Rezime testova

| Fajl                                  | Tip         | Slučajeva | Šta pokriva                                       | Komanda            |
| ------------------------------------- | ----------- | --------- | ------------------------------------------------- | ------------------ |
| `features/payment/card-utils.test.ts` | unit        | 27        | Luhn, format kartice/expiry, future-expiry, brend | `npm test`         |
| `store/booking-store.test.ts`         | unit        | 7         | kaskadna logika store-a (čišćenje korpe/datuma)   | `npm test`         |
| `lib/api/client.test.ts`              | integration | 3         | normalizacija API grešaka u `ApiError`            | `npm test`         |
| `e2e/booking-flow.spec.ts`            | E2E         | 1         | ceo flow hotel→confirmation (mock API)            | `npm run test:e2e` |

**Ukupno: 37 unit/integration (Vitest) + 1 E2E (Playwright).** Detalji po fajlu su niže.

## Alati

| Alat                      | Za šta                     | Pokreće se                                |
| ------------------------- | -------------------------- | ----------------------------------------- |
| **Vitest**                | unit / logika / komponente | `npm test` (jednom), `npm run test:watch` |
| **React Testing Library** | komponente (DOM)           | kroz Vitest (`jsdom`)                     |
| **Playwright**            | E2E (ceo flow u browseru)  | `npm run test:e2e`                        |

Konfiguracija: `vitest.config.ts` (alias `@/`, `jsdom`, setup), `vitest.setup.ts`
(jest-dom matcheri), `playwright.config.ts` (dev server + chromium).

## Konvencija — ko-lokacija

Unit/komponenta test stoji **pored fajla** koji testira:

```
src/features/payment/card-utils.ts
src/features/payment/card-utils.test.ts   ← isti folder
```

Lako se nađe, odmah se vidi šta je pokriveno. E2E je izuzetak — ide u `/e2e/` jer
testira ceo app, ne jedan modul.

## Kako se piše test (mentalni model)

Svaki test ima 3 koraka — **Arrange / Act / Assert** (pripremi / pozovi / proveri):

```ts
it('ignoriše razmake u broju kartice', () => {
  const input = '4242 4242 4242 4242' // Arrange — ulaz
  const result = luhnCheck(input) // Act — pozovi funkciju
  expect(result).toBe(true) // Assert — proveri rezultat
})
```

Korisni obrasci koje koristimo:

- **`describe`** grupiše testove jedne funkcije; **`it`/`test`** je jedan slučaj.
- **`it.each([...])`** — isti test sa više ulaza (tabela slučajeva) bez ponavljanja.
- **`vi.useFakeTimers()` + `vi.setSystemTime(...)`** — _zamrzne "danas"_ da test koji
  zavisi od datuma (`isFutureExpiry`) bude deterministican (ne pukne sledeće godine).

## Pokriveno

### ✅ `features/payment/card-utils.test.ts` (27 slučajeva)

Najrizičnija logika — validacija kartice. Testira svih 5 funkcija:

- **`luhnCheck`** — validni test-brojevi (Visa/MC/Amex) prolaze; pogrešna kontrolna
  cifra, prekratak broj i smeće padaju; razmaci se ignorišu.
- **`formatCardNumber`** — grupe po 4, sečenje na 19 cifara, uklanjanje ne-cifara.
- **`formatExpiry`** — auto `MM/YY` crta, sečenje na 4 cifre.
- **`isFutureExpiry`** — (sa zamrznutim vremenom) budući datum / tekući mesec važe;
  prošli mesec, nevalidan mesec i fali-godina padaju.
- **`detectBrand`** — Visa/MC (uklj. novi `2221` opseg)/Amex/Discover/Diners/Maestro
  i `unknown` po prefiksu cifara.

### ✅ `store/booking-store.test.ts` (7 slučajeva)

Kaskadna logika store-a (testirana preko `getState()`, bez React rendera):

- **`setProperty`** poništava datume + korpu (drugi hotel = druge sobe/cene).
- **`setDates`** — ČUVA korpu kad su datumi isti, BRIŠE je kad se promene.
- **`addToCart`** dodaje sa jedinstvenim id-jem; **`updateCartItem`** menja samo
  ciljanu stavku; **`removeCartItem`** briše po id-ju; **`reset`** čisti sve.

### ✅ `lib/api/client.test.ts` (3 slučaja)

Axios interceptor svodi oba oblika greške na jednu `ApiError` (podmetnut `adapter`
umesto mreže):

- **`ErrorResponse`** (`{error,message}`) → `ApiError` sa porukom/statusom/kodom.
- **Zod greška** → deserijalizuje serijalizovani niz i izvuče **prvu** issue poruku.
- **Nepoznat oblik** → fallback, i dalje instanca `ApiError`.

### ✅ `e2e/booking-flow.spec.ts` (Playwright, 1 scenario)

Happy-path kroz **ceo flow**: hotel → datumi → soba → payment → confirmation.

- **Mock API** (`e2e/fixtures.ts` → `mockApi(page)`): `page.route("**/api/**", ...)`
  presreće svaki zahtev u browseru i vraća fiksne odgovore (oblici iz ENDPOINTS.md)
  → test je deterministican, ne zavisi od živog API-ja.
- Pokriva ono što unit testovi ne mogu: navigaciju, zaštitu ruta, upis u store kroz
  korake, popunjavanje forme i kreiranje rezervacije.
- Na kraju proverava `"Your reservation is confirmed!"` + broj rezervacije (`bookingId`).

> Selektori: prvenstveno po roli/labeli (`getByRole`, `getByLabel`); placeholder samo
> tamo gde `FormControl` id ne ide na sam input (npr. Card number je umotan u `div`).

## Pokretanje

```bash
npm test                  # svi unit/integration testovi, jednom (regresije / CI)
npm run test:watch        # watch mod tokom razvoja (pokreće samo pogođene testove)
npm test -- card-utils    # samo fajlovi čije ime sadrži "card-utils" (ciljano)
npm run test:e2e          # Playwright E2E

# Pre prvog E2E pokretanja — instaliraj browser (jednom):
npx playwright install chromium
```

> Praksa: `test:watch` dok razvijaš (sam bira pogođene testove), `npm test` (sve) pre
> commit-a kao mreža za regresije, a `npm test -- <ime>` kad ciljano debug-uješ jedan.
