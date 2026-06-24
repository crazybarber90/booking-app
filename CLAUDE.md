# CLAUDE.md — Booking App

Ovaj fajl je kontekst za Claude Code. Opisuje zadatak, arhitekturu i pravila.
**Status: IMPLEMENTIRANO.** Sva 4 koraka flow-a su napravljena, `ENDPOINTS.md` je
popunjen pravim API-jem, a `Providers` je uvezan u `layout.tsx`. Fajl se sad
održava kao referenca arhitekture i konvencija.

> Next.js 16 pravila za agente su na dnu ovog fajla (sekcija 9).

---

## 1. Šta je zadatak

Frontend tehnički zadatak: napraviti **Booking aplikaciju** (rezervacija
smeštaja / hotela) koja spaja zadati **Figma dizajn** sa zadatim **API-jem
(Swagger)**. Cilj je da se pokrije kompletan multi-step "checkout flow" — od
izbora hotela do potvrde rezervacije.

- **Rok:** 30.06.2026. do 12h.
- **Payment:** ide do kraja, ali kao **simulacija** (mock) — nema prave
  integracije platnog procesora. Forma i ponašanje moraju da izgledaju kao
  pravi sistem (validacija, loading, error handling).
- **Dizajn:** nije korišćen Figma MCP, nego **screenshot-i** dizajna (čitaju se
  preko Read tool-a). Razlozi i kako bi MCP išao — detaljno u `DESIGN.md`.

## 2. User flow (4 koraka)

1. **Choose Accommodation + Dates** — korisnik bira hotel (npr. Palace Elisabeth)
   i datume na kalendaru.
2. **Choose Room / Cart** — prikaz dostupnih soba i paketa (Best Available Rate,
   All About You...), izbor broja odraslih/dece, korpa sa desne strane.
3. **Payment** — forma za podatke gosta (ime, prezime, email, telefon) i karticu
   (broj, ekspiracija, CVV) + Reservation Summary sa desne strane.
4. **Confirmation** — "Your reservation is confirmed!" sa brojem rezervacije i
   detaljima.

## 3. API endpointi

> **Izvor istine je `ENDPOINTS.md`** (popunjen pravim OpenAPI spec-om i live
> response-ima). Dole je samo brza mapa endpoint → korak.

| Endpoint | Metoda | Korak | Svrha |
|---|---|---|---|
| `/properties` | GET | 1 | Lista hotela |
| `/properties/{propertyId}/units` | GET | 2 | Smeštajne jedinice (sobe) hotela |
| `/properties/{propertyId}/calendar` | GET | 1 | Cene i dostupnost po danima (bojenje kalendara) |
| `/properties/{propertyId}/availability` | POST | 1→2 | { checkin, nights } → slobodne sobe i rate planovi |
| `/bookings` | POST | 3→4 | Kreiranje rezervacije, vraća broj rezervacije |

Base URL ide u `.env.local` kao `NEXT_PUBLIC_API_URL` (vidi `.env.example`).

## 4. Tech stack (detalji u STACK.md)

- **Next.js 16 (App Router) + TypeScript** — routing po koraku flow-a.
- **TailwindCSS v4** — stilizacija po Figmi.
- **shadcn/ui (Base UI)** — UI primitivi u `src/components/ui/` (NISU dizajn,
  samo neutralni blokovi koji se stilizuju).
- **Zustand** — state kroz korake (izbor hotela → datumi → sobe → gost).
- **TanStack Query** — fetch/cache/loading/error za API.
- **React Hook Form + Zod** — forme i validacija (payment).
- **axios** — HTTP klijent (`src/lib/api.ts`).

## 5. Struktura foldera

```
src/
  app/                 # Next.js App Router — ruta po koraku flow-a
    dates/             #   korak 1: izbor hotela + datuma
    rooms/             #   korak 2: izbor sobe / korpa
    payment/           #   korak 3: forma gosta + kartica (mock)
    confirmation/      #   korak 4: potvrda rezervacije
  components/
    ui/                # shadcn/ui primitivi (button, input, calendar, form...)
  config/
    colors.ts          # centralna paleta (brand boje iz Figme + semantic tokeni)
  features/            # logika po koraku (accommodation, dates, rooms, payment, confirmation)
  store/
    booking-store.ts   # Zustand state kroz korake
  types/               # deljeni TS tipovi (API modeli)
  lib/
    api.ts             # axios instanca + error interceptor
    providers.tsx      # TanStack Query provider (wrapuje app)
    utils.ts           # cn() helper (shadcn)
ENDPOINTS.md           # API dokumentacija (popunjeno — izvor istine za API)
STACK.md               # zašto svaka tehnologija
```

## 6. Pravila / konvencije

- **Boje:** nikad hardkodovan hex u komponentama. Koristi Tailwind semantic
  klase (`bg-primary`, `text-muted-foreground`) ili `src/config/colors.ts`.
  Semantic vrednosti se menjaju u `src/app/globals.css`.
- **State:** podaci koji žive kroz korake idu u Zustand store; serverski podaci
  (hoteli, sobe, dostupnost) idu kroz TanStack Query.
- **Forme:** sve validacije preko Zod šeme + React Hook Form.
- **API:** svi pozivi kroz `src/lib/api.ts`, nikad direktan `fetch` po
  komponentama.
- **Payment:** mock submit — pokaži loading na dugmetu, blokiraj dupli klik,
  hendluj grešku (toast/poruka), tek na uspeh idi na Confirmation.

## 7. Status implementacije

- Sva 4 koraka flow-a su napravljena (`dates`, `rooms`, `payment`, `confirmation`).
- Endpointi su potvrđeni i dokumentovani u `ENDPOINTS.md` (pravi OpenAPI spec).
- Zustand store (`src/store/booking-store.ts`), API sloj i Zod šeme su na mestu.
- `Providers` je uvezan u `layout.tsx` (TanStack Query + `Toaster`).
- Payment je mock simulacija (validacija + loading + error handling, bez pravog procesora).
- **Testovi:** Vitest (card-utils, store, API greške) + 1 Playwright E2E (ceo flow,
  mock API). Ciljano na najrizičnije, ne coverage broj. Detalji u `TESTS.md`.

## 8. Komande

```bash
npm run dev        # dev server
npm run build      # produkcijski build
npm run lint       # eslint
npm test           # Vitest unit/integration testovi
npm run test:e2e   # Playwright E2E (prvi put: npx playwright install chromium)
```

---

## 9. Pravila za agente — Next.js 16

> Ranije zaseban `AGENTS.md`, sada inline.

**Ovo nije Next.js koji znaš.** Ova verzija ima breaking changes — API-ji,
konvencije i struktura fajlova mogu da se razlikuju od onoga što je u training
podacima. Pročitaj odgovarajući vodič u `node_modules/next/dist/docs/` pre nego
što pišeš bilo kakav kod. Obrati pažnju na deprecation upozorenja.
