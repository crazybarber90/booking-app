# steps-flow.md — Tok aplikacije (korak po korak)

Opis **gde, kada i šta** se dešava u booking wizard-u. Jedan korak = jedna ruta.
Status: ✅ gotovo · 🚧 u izradi · ⬜ planirano.

## Mapa ruta

| Korak | Ruta            | Ekran                | Status |
| ----- | --------------- | -------------------- | ------ |
| 1     | `/`             | Choose Accommodation | ✅     |
| 2     | `/dates`        | Choose Dates         | ✅     |
| 3     | `/rooms`        | Choose Room / Cart   | ✅     |
| 4     | `/payment`      | Payment              | ✅     |
| 5     | `/confirmation` | Confirmation         | ✅     |

## Kako podaci teku (svaki korak isto)

```
API poziv  →  React Query hook  →  pametan container  →  glupe UI komponente
                                          ↕
                                   Zustand store (odluke korisnika)
```

> **Pravilo:** serverski podaci žive u React Query, korisnikove odluke u Zustand
> store-u (`src/store/booking-store.ts`). Detalji: `ARHITEKTURA.md`.

---

## ✅ KORAK 1 — Choose Accommodation (`/`)

**Cilj:** korisnik bira hotel.

**Kad se ekran učita:**

1. `accommodation-screen.tsx` (container) se montira → poziva `useProperties()`.
2. `useProperties` → `getProperties()` → `axios GET /api/properties` → (proxy) → API.
3. React Query kešira pod `["properties"]`.
4. `data` → `<AccommodationPanel>` → po jedan `<PropertyListItem>` (ime + tip).

**Kad klikneš hotel:**

1. `PropertyListItem.onSelect` → `handleSelect(property)` u containeru.
2. `setProperty(property)` → **upiše hotel u Zustand store** (+ localStorage).
3. `router.push("/dates")` → **prelazak na korak 2**.

> Dugme „Izaberi smeštaj" se vidi samo ako je modal zatvoren — samo ga ponovo otvara.

**Ključni fajlovi:** `features/accommodation/*`, `lib/api/properties.ts`, `store/booking-store.ts`.

---

## ✅ KORAK 2 — Choose Dates (`/dates`)

**Cilj:** korisnik bira check-in i check-out na kalendaru.

**Zaštita rute:** ako u store-u nema izabranog hotela → `router.replace("/")`
(ne može korak 2 bez koraka 1).

**Kad se ekran učita:**

1. `dates-screen.tsx` (container) čita `property` iz store-a.
2. Računa prozor od **2 meseca** (od danas) → `start`/`end`.
3. `useCalendar(propertyId, start, end)` → `GET /api/properties/{id}/calendar?start&end`.
4. Odgovor (`days[]` sa `available` + `rateFromValue`) → mapa `YYYY-MM-DD → dan`.
5. `<DatesPanel>` crta 2 × `<MonthCalendar>`; svaki dan ima broj + cenu, a
   nedostupni/prošli dani su **disabled**.

**Kad biraš datume (logika raspona u containeru):**

- 1. klik → **check-in** (i briše stari check-out).
- 2. klik posle check-in → **check-out**.
- klik pre check-in → check-in se pomera.
- `nights` = razlika u danima (`differenceInCalendarDays`).

**Kad klikneš CONFIRM:**

1. `setDates({ checkin, checkout, nights })` → **upiše datume u store**.
2. `router.push("/rooms")` → **prelazak na korak 3**.

**Strelice ◀ ▶** pomeraju prozor meseci → menja se `queryKey` → React Query
povlači novi opseg (i kešira ga). Nazad ne ide pre tekućeg meseca.

**Ključni fajlovi:** `features/dates/*`, `lib/api/calendar.ts`.

---

## ✅ KORAK 3 — Choose Room / Cart (`/rooms`)

**Cilj:** korisnik bira sobu + rate plan i puni korpu.

**Zaštita rute:** nema hotela → `/`; ima hotel ali nema datuma → `/dates`.

**Kad se ekran učita (spajanje dva poziva):**

1. `rooms-screen.tsx` čita `property` i `dates` iz store-a.
2. `useUnits(propertyId)` → `GET /units` → ime + slika svake sobe.
3. `useAvailability(propertyId, checkin, nights)` → `POST /availability` →
   slobodne jedinice + rate planovi (cene).
4. **Spajanje po `unitId`:** availability daje cene ali ne i ime/sliku → pravim
   mapu `unitId → {ime, slika}` iz `/units` i spojim sa availability.
5. `<RoomCard>` po sobi (slika + ime + svi `<RateOption>` sa SELECT).

**Kad klikneš SELECT na rate:**

1. `handleSelectRate(unit, rate)` → `addToCart(...)` u store
   (`unitId, rateId, quantity:1` + denormalizovan prikaz: ime, cena, gosti).
2. Korpa (`<CartPanel>`) prikaže stavku; total = Σ `unitPrice × quantity`.

**U korpi:** steppers za odrasle/decu/broj soba (`updateCartItem`), kanta za
brisanje (`removeCartItem`). **CONTINUE** → `router.push("/payment")` (**korak 4**).

> **Gosti (odrasli/deca) se NE šalju na API** — booking ih ne prima. Čuvamo ih
> samo za prikaz u summary/confirmation.

### Pojašnjenja

**„Spajanje 2 poziva":** to NISU dva zahteva u jednom — to su dva odvojena
poziva (`GET /units` i `POST /availability`) čije **podatke spajam u kodu**.
Zamisli dve Excel tabele sa istom kolonom `unitId`: `/units` ima ime+sliku,
`/availability` ima cene. Spojim ih **po `unitId`** (kao `VLOOKUP`) → jedan red
po sobi sa svim podacima. GET vs POST je nebitno; spajaju se odgovori, ne zahtevi.
Tehnički: napravim mapu `unitId → {ime, slika}` iz `/units`, pa za svaku sobu iz
`/availability` izvučem ime/sliku iz mape.

**`crypto.randomUUID()` (nije importovan!):** `crypto` je **globalni objekat
browsera** (i Node 20), kao `Math`/`JSON` — zato se ne uvozi. Vrati nasumičan
jedinstven string (npr. `f47ac10b-...`). Koristim ga kao `id` svake stavke korpe
jer ista soba može u korpu više puta → treba stabilan, jedinstven ključ za
React `key` i za precizno brisanje/izmenu stavke.

**Ključni fajlovi:** `features/rooms/*`, `lib/api/availability.ts`, `lib/api/properties.ts` (units).

## ✅ KORAK 4 — Payment (`/payment`)

**Cilj:** unos podataka gosta + kartice i kreiranje rezervacije.

**Zaštita rute:** nema hotela → `/`; nema datuma → `/dates`; prazna korpa → `/rooms`.

**Layout (po Figmi):** crna traka gore (BACK + logo + **Stepper**), levo forma u 2
pod-kolone (Guest details / Payment method), desno **Reservation Summary** (iz store-a).

**Validacija (RHF + Zod, `zod-schema.ts`):**

- email, ime, prezime, telefon (country code + broj) — obavezno.
- kartica: 12–19 cifara + **Luhn**; formatira se u grupe po 4 dok kucaš; brend
  (Visa/Mastercard…) se prepoznaje po prvim ciframa.
- `MM/YY`: validan mesec + **u budućnosti**; CVV 3–4 cifre.
- terms checkbox mora biti čekiran.

**Kad klikneš CONFIRM RESERVATION:**

1. Sastavim `BookingRequest` iz store-a (propertyId, checkin, nights, units) +
   forme (guest, payment).
2. `useCreateBooking` → `POST /bookings` (**mutation**; dugme „PROCESSING…",
   blokiran dupli klik).
3. Uspeh → `setGuest` + `setBooking` u store → `router.push("/confirmation")`.
4. Greška → toast sa porukom (ne ide dalje).

> **Kartica se NE čuva** u store-u (samo se pošalje u mutation). Telefon se spaja
> kao `countryCode + broj`. Gosti/extras ostaju samo za prikaz.

**Ključni fajlovi:** `features/payment/*`, `lib/api/bookings.ts`,
`components/layout/{wizard-header,stepper}.tsx`.

## ✅ KORAK 5 — Confirmation (`/confirmation`)

**Cilj:** prikaz potvrde uspešne rezervacije.

**Zaštita rute:** nema rezultata rezervacije u store-u (`booking`) → `/`.

**Kad se ekran učita:**

1. `confirmation-screen.tsx` čita iz store-a: `booking` (rezultat API-ja),
   `property`, `dates`, `cart`, `guest`.
2. Izračuna: dana do dolaska (`checkin − danas`), ukupno gostiju
   (Σ adults/children × quantity).
3. `<ConfirmationView>` iscrta: zeleni ✓ „Your reservation is confirmed!",
   broj rezervacije (`booking.bookingId`), Guest details, Reservation details
   (check-in/out, nights, hotel, sobe, gosti, **Total iz `booking.totalPrice`**).

**Kad klikneš GO BACK TO HOMEPAGE:**

1. `reset()` → očisti ceo store (hotel, datumi, korpa, gost, booking).
2. `router.push("/")` → nazad na korak 1.

> Total i broj noći uzimamo iz **API odgovora** (`booking`), ne iz lokalnog
> računa — server je merodavan. Broj rezervacije je pravi `bookingId` (UUID).

**Ključni fajlovi:** `features/confirmation/*`.

---

## Dodatak — CORS / proxy (detaljno)

### Zašto nije radilo

axios je iz **browsera** zvao direktno
`https://test-booking-api.bid.workers.dev/properties`. To je **drugi origin** od
`localhost:3000`. Browser ima sigurnosno pravilo: smeš da čitaš odgovor sa drugog
origin-a **samo ako mi taj server da dozvolu** (header `Access-Control-Allow-Origin`).
Taj API ga **ne šalje** → browser **blokira** odgovor, iako je server vratio `200`.

> Zato je `curl` radio, a browser ne: `curl` nema to pravilo. **CORS je zaštita u
> browseru, nije serverska greška.**

### Kako proxy rešava — gde tačno

Dva fajla:

- **`next.config.ts`** → `rewrites()`: pravilo „sve `/api/*` preusmeri na pravi API".
- **`.env.local`** → `NEXT_PUBLIC_API_URL=/api` → axios sad zove `/api/...`
  umesto pune cross-origin URL.

Tok posle popravke:

```
Browser  →  localhost:3000/api/properties      (ISTI origin → browser srećan, nema CORS)
              ↓  (Next server presretne /api/*)
Next server  →  test-booking-api.../properties  (server → server, CORS ne važi)
              ↓
            vrati podatke nazad browseru
```

Browser nikad ne vidi „drugi origin" — sve mu deluje kao isti sajt. Zato CORS nestane.
(Isto objašnjenje i u `ARHITEKTURA.md`.)

---

## Dodatak — „čudne stvari" (zašto baš tako)

### 1. POST endpoint, a koristimo `useQuery` (ne `useMutation`)

`/availability` je **POST**, ali samo **čita** dostupnost (ništa ne menja na
serveru) — POST je samo zato što šalje telo sa datumima. Pošto suštinski čita,
omotali smo ga u **`useQuery`** da dobijemo cache/loading/error kao kod GET-a.
`useMutation` čuvamo za prave izmene (kreiranje rezervacije u koraku 4 — Payment).

> Pravilo: bitno je **šta poziv radi** (čita/menja), ne koji je HTTP glagol.

### 2. `crypto.randomUUID()` za stavke korpe

Kad dodaš sobu u korpu, dam joj **nasumičan jedinstven `id`**. Zašto:

- Ista soba+rate može da se doda više puta (dizajn: „Room 1", „Room 2").
- React traži stabilan `key` za listu, a brisanje cilja tačnu stavku po `id`.
  `crypto.randomUUID()` je ugrađen u browser (i Node 20) — ne treba biblioteka.

### 3. `useHydrated` pre redirecta na zaštićenim rutama

Zustand `persist` čita izbor iz `localStorage` tek na klijentu. Pre toga je sve
`null`, pa bismo pogrešno redirektovali. `useHydrated` (preko
`useSyncExternalStore`) vrati `true` tek posle hidracije → tek tad proveravamo
store. Bez `setState` u efektu (što React 19 prijavljuje) i bez hydration
mismatch-a.

### 4. Šta `persist` čuva, a šta NE

`persist` upisuje **ceo store** u `localStorage` (ključ `booking-store`) na svaku
promenu i čita ga nazad pri učitavanju → **store preživi refresh**. Ali čuva
**samo store**, NE lokalno `useState` stanje komponenti.

- Zato kalendar (`checkIn/checkOut` su lokalni) izgleda prazno kad se vratiš —
  datumi JESU u store-u, pa ih u `dates-screen` **pre-popunjavamo iz `store.dates`**.
- Korpa se namerno briše kad se **datumi promene** (nove cene). Ponovna potvrda
  ISTIH datuma ne dira korpu (`setDates` proverava da li su se datumi stvarno promenili).
