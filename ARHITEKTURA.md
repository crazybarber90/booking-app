# ARHITEKTURA.md

Kako je app organizovan i zašto. Kratko.

## Formalni nazivi obrazaca

Ono što je dole opisano su standardni (senior) softver-inženjerski obrasci:

- **Separation of Concerns** — krovni princip: UI, biznis logika i pristup
  podacima su odvojeni.
- **Presentational / Container components** (a.k.a. „smart vs dumb components"):
  glupe komponente (`features/*/components/`) samo primaju props i renderuju;
  pametan container (`*-screen.tsx`) orkestrira.
- **Custom hooks** — data-fetch / API logika izvučena iz UI-a u `features/*/hooks/`.
- **Feature-Sliced / feature-based architecture** — kod grupisan po domenu
  (kolokacija), ne po tipu fajla.
- **Layered architecture** — slojevi ispod.

## Slojevi (logika odvojena od UI-a)

```
API  →  Query hook  →  Store  →  Glupa UI komponenta  →  Pametan container
```

| Sloj           | Folder                    | Posao                             | Zna za React?   |
| -------------- | ------------------------- | --------------------------------- | --------------- |
| **API**        | `src/lib/api/`            | sirovi HTTP pozivi + tipovi       | ne              |
| **Query hook** | `features/*/hooks/`       | loading/error/cache (React Query) | da              |
| **Store**      | `src/store/`              | korisnikove odluke (Zustand)      | da              |
| **Glupa UI**   | `features/*/components/`  | samo izgled, prima props          | da (bez logike) |
| **Container**  | `features/*/*-screen.tsx` | spaja hook + store + UI           | da              |

## Zašto baš tako

- **Glupe komponente** (npr. `property-list-item.tsx`): primaju samo props, nemaju
  fetch ni store. Lako se testiraju i ponovo koriste, lak debug — ako nešto loše
  izgleda, znaš da je tu; ako podaci fale, znaš da je u containeru.
- **Pametan container** (`accommodation-screen.tsx`): jedino mesto koje zove API i
  store. Sva "logika" na jednom mestu.
- **Store vs Query**:
  Zustand = _naše odluke_ (izabran hotel, datumi).
  React Query = _serverski podaci_ (lista hotela). Ne mešamo — najčešći izvor bagova.
- **Feature folderi**: sve za jedan korak na jednom mestu (`features/accommodation`),
  ne razbacano po tipu fajla.

## API proxy (CORS fix)

API ne šalje CORS header → browser blokira direktan poziv. Zato:

- `next.config.ts` → `rewrites()`: browser zove naš `/api/*`, Next server-side
  preusmeri na pravi API. Isti origin za browser = nema CORS.
- axios `baseURL = /api` (`.env.local`), pravi origin u `BOOKING_API_ORIGIN`.

## API greške (dva oblika)

Interceptor u `lib/api/client.ts` normalizuje oba (`{error,message}` i Zod
`{success,error}`) u jednu `ApiError` klasu → ostatak appa uvek dobije čistu poruku.

## Formatiranje cena

Prikaz novca je centralizovan u `lib/format.ts` preko ugrađenog `Intl.NumberFormat`
(`hr-HR` + EUR → `4.748,00 €`) — bez zavisnosti, jedno mesto za izmenu. Namerno **bez
money-biblioteke**: format je kozmetika, merodavan iznos daje server (`booking.totalPrice`),
a float-tačnost ne treba jer frontend ne računa decimalne sume.

## Status

Svi ekrani gotovi (flow je 4 koraka iz `CLAUDE.md`; accommodation+dates su korak 1):

- **Accommodation** — lista hotela sa API-ja (glup/pametan split).
- **Dates** — kalendar (dostupnost + cene po danu).
- **Rooms / Cart** — availability, rate planovi, korpa.
- **Payment** — mock plaćanje, Zod validacija.
- **Confirmation** — `POST /bookings` → potvrda rezervacije.
- Detalji zadatka: `CLAUDE.md` · stack: `STACK.md` · dizajn: `DESIGN.md` · API: `ENDPOINTS.md`.
