# STACK.md — Tehnologije i zašto

Pregled izabranog stack-a za Booking aplikaciju i obrazloženje **zašto** je
svaka tehnologija izabrana baš za ovaj zadatak (multi-step booking flow + API).

---

## Next.js 16 (App Router) + TypeScript

**Šta:** React framework sa file-based routingom i SSR/RSC.
**Zašto:**
- Booking je **multi-step flow** (hotel → datumi → soba → plaćanje → potvrda).
  App Router daje prirodan URL po koraku (`/booking/rooms`, `/booking/payment`...),
  pa korisnik može da osveži stranicu, koristi back dugme i deli link.
- TypeScript hvata greške pre runtime-a — bitno kad podaci putuju kroz više
  ekrana i kad mapiramo API response oblike.
- Standard za frontend pozicije → očekivani izbor na tehničkom zadatku.

## TailwindCSS v4

**Šta:** utility-first CSS.
**Zašto:**
- Najbrži način da se **1:1 isprati Figma** (spacing, boje, tipografija) bez
  skakanja između CSS fajlova.
- Konzistentnost kroz dizajn token sistem (semantic boje u `globals.css`).

## shadcn/ui (na Base UI)

**Šta:** kolekcija pristupačnih UI komponenti koje se **kopiraju u projekat**
(`src/components/ui/`), a ne instaliraju kao crna kutija. Ova verzija je
izgrađena na **Base UI** (naslednik Radix-a od istog tima).
**Zašto:**
- Gotova **pristupačnost** (a11y, fokus, tastatura) za Dialog, Select, Calendar,
  Popover — teško i sporo da se piše ručno, a recenzenti to cene.
- Pošto je kod u našem repou, **potpuno ga stilizujemo** da liči na Figmu — nije
  "tuđi" dizajn koji se bori sa našim.
- Ubrzava payment formu (Form + Input + Label već povezani sa validacijom).

## Zustand (client / UI state)

**Šta:** mali state manager.
**Zašto:**
- Podaci se nose **kroz 4–5 koraka** pre slanja (izabrani hotel, datumi, sobe,
  broj gostiju, podaci o gostu). Treba globalni store koji preživi navigaciju.
- U poređenju sa **Redux**: mnogo manje boilerplate-a (nema action/reducer
  ceremonije) — brže za rok od nedelju dana.
- U poređenju sa **React Context**: Context re-renderuje sve potrošače na svaku
  promenu i nije pravljen za često menjanje stanja; Zustand renderuje samo ono
  što zaista koristi taj komad state-a (selektori) → bolji performansi.
- Ima `persist` middleware → korpa/izbor preživi refresh stranice.

## TanStack Query / React Query (server state)

**Šta:** biblioteka za fetch, cache i sinhronizaciju **serverskih** podataka.
**Zašto:**
- Hoteli, kalendar, dostupnost i sobe dolaze sa API-ja. React Query daje
  **caching, loading i error stanja, retry i dedupe** zahteva besplatno — ne
  pišemo ručno `useEffect + useState + try/catch` svuda.
- **Bitna razlika:** Zustand čuva *naše* odluke (šta je korisnik izabrao),
  React Query čuva *serverske* podatke (šta API kaže). Razdvajanje to dvoje je
  čista arhitektura — ne guramo API odgovore u globalni store ručno.
- `POST /bookings` ide kao **mutation** → ugrađen `isPending` za loading na
  dugmetu i `onError` za toast, što je tačno ono što payment korak traži.

## React Hook Form + Zod

**Šta:** RHF upravlja formama (vrednosti, fokus, submit), Zod definiše šemu
validacije; spojeni preko `@hookform/resolvers`.
**Zašto:**
- Payment forma traži **strogu validaciju** (broj kartice 16 cifara + Luhn,
  ekspiracija u budućnosti, CVV 3–4 cifre, email, telefon). Zod to opisuje
  deklarativno na jednom mestu i automatski daje TypeScript tipove.
- RHF je **uncontrolled** → minimalno re-rendera, glatko kucanje i formatiranje
  inputa u realnom vremenu (razmaci u broju kartice, `MM/YY`).

## axios

**Šta:** HTTP klijent.
**Zašto:**
- Jedna instanca (`src/lib/api.ts`) sa `baseURL` i **interceptor-om za greške**
  → sve API funkcije dele istu konfiguraciju i jednoobrazno hvatanje grešaka.
- Lakši rad sa JSON-om i greškama nego goli `fetch`.

## date-fns

**Šta:** utili za datume.
**Zašto:**
- Kalendar i `checkIn/checkOut` traže formatiranje, poređenje i računanje broja
  noći. `date-fns` je modularan (tree-shakeable) — uvozimo samo što treba.

## lucide-react

**Šta:** set ikonica.
**Zašto:**
- Standardne ikonice (kalendar, korpa, strelice, kartica) koje shadcn već koristi
  → konzistentan vizuelni jezik bez ručnog crtanja SVG-ova.

---

## Kako sve sarađuje (ukratko)

```
Korisnik bira  ──►  Zustand store (izbor: hotel, datumi, sobe, gost)
                         │
API podaci     ──►  TanStack Query (hoteli, kalendar, dostupnost)  ──► axios ──► API
                         │
Payment forma  ──►  React Hook Form + Zod (validacija)
                         │
Submit (mock)  ──►  React Query mutation  ──► POST /bookings ──► Confirmation
```

> Boje i dizajn tokeni: `src/config/colors.ts` + `src/app/globals.css`.
> Detaljan opis zadatka i pravila: `CLAUDE.md`.
