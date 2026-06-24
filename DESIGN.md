# DESIGN.md — Vizuelni izvor istine (Figma)

## Zašto ovaj fajl postoji

Dizajn je zadat kao **slike**, ne kao živi Figma fajl sa dev-mode inspekcijom. Da
se layout ne bi „pamtio iz glave" niti otvarao ručno pri svakoj izmeni, ovaj fajl
je **mašinski čitljiv indeks dizajna**: mapira svaki ekran na tačan screenshot na
disku i destiluje vizuelni jezik (boje, tipografija, komponente, stanja) u tekst.

Cilj je **agentski razvoj**: AI (Claude Code) preko Read tool-a otvori tačnu sliku
za ekran na kom radi i reprodukuje UI verno — umesto da nagađa. Time je dokument
deo namerne podele odgovornosti, gde je **svaki fajl tačno jedan izvor istine**:

| Dokument           | Izvor istine za                                      |
| ------------------ | ---------------------------------------------------- |
| `DESIGN.md` (ovaj) | **kako izgleda** — layout, boje, tipografija, stanja |
| `ENDPOINTS.md`     | **koji su podaci** — API ugovor, oblici response-a   |
| `ARHITEKTURA.md`   | **kako je kod organizovan** — slojevi, obrasci       |
| `CLAUDE.md`        | **šta je zadatak i koja su pravila**                 |

> ⚠️ **Dizajn NIJE izvor podataka.** Imena hotela, cene, datumi i broj rezervacije
> na slikama (`Palace Elisabeth`, `2 Apr – 6 Apr 2024`, `4.748,00 €`, `SH998375899`)
> su Figma placeholder-i. Pravi sadržaj dolazi iz API-ja (`ENDPOINTS.md`) — npr. API
> vraća `Hotel Centar Zagreb` i UUID `bookingId`. Iz dizajna se preuzima **forma i
> ponašanje**, nikad doslovan tekst — te vrednosti se ne hardkoduju.

**Ne brisati screenshot fajlove** — bez njih je ovaj indeks beskoristan.

> Folder: `C:\Users\Medion\OneDrive\Слике\Snimci ekrana\`

---

## Zašto screenshotovi, a ne Figma MCP

Figma fajl jeste bio dostupan — može da se otvori i inspektuje (u desnom panelu se
vide tipografija `Playfair Display`, boje, dimenzije frame-ova). Rad iz screenshot-ova
je ipak bila svesna odluka, iz dva razloga.

**1. Dev Mode MCP server traži Figma _desktop_ app — ja sam radio iz browsera.** MCP
server se pokreće kao **lokalni server** iz desktop aplikacije (Preferences → „Enable
Dev Mode MCP Server", endpoint npr. `http://127.0.0.1:3845/mcp`). U browseru taj server
ne postoji. Da bih ga koristio morao bih da instaliram desktop app i podesim MCP
konekciju u alatu (Claude Code / Cursor) — što za ovaj obim zadatka nije bilo neophodno.

**2. I uz desktop, MCP sam po sebi ne garantuje pixel-perfect.** Kvalitet izlaza zavisi
od toga koliko je fajl _uređen_ — to nije automatski:

- `get_variable_defs` vrati tokene **samo ako su definisani kao Figma Variables / Styles**;
  na raw vrednostima (ručno ukucan hex) nema tokena.
- `get_code_connect_map` radi **samo ako je podešen Code Connect** (mapiranje Figma
  komponente ↔ komponente u kodu) — poseban setup, po defaultu ga nema.
- `get_code` daje upotrebljiv kod **samo uz uredan auto-layout, imenovane slojeve i
  prave komponente**; inače je šum koji ionako čistiš.

**Zaključak:** za statičan, fiksiran dizajn ovog obima, ručno iščitavanje + sopstveni
token sistem (`src/config/colors.ts` + semantic klase u `globals.css`) daje kontrolisan,
predvidljiv rezultat nezavisan od tuđe Figma higijene. MCP način rada postoji i znam kako
se postavlja — isplati se na velikim, živim dizajn sistemima koji se stalno menjaju, ne
na fiksnom setu od 8 ekrana.

> **Kako bi MCP išao:** Figma **desktop** → Preferences → „Enable Dev Mode MCP Server" →
> u Claude Code / Cursor dodaš taj MCP server (`127.0.0.1:3845`) → selektuješ frame →
> pozoveš `get_code`, `get_variable_defs`, `get_image`, `get_code_connect_map`.

---

# SCREEN-SHOTOVI

| #   | Ekran                                               | Fajl                               |
| --- | --------------------------------------------------- | ---------------------------------- |
| 1   | ChooseAccommodation (lista hotela)                  | `Screenshot 2026-06-23 161815.png` |
| 2   | ChooseDates (kalendar, 2 meseca, legenda)           | `Screenshot 2026-06-23 161835.png` |
| 3   | ChooseDates / Legend popup                          | `Screenshot 2026-06-23 161841.png` |
| 4   | ChooseRoom (lista soba + rate opcije)               | `Screenshot 2026-06-23 161905.png` |
| 5   | ChooseRoom / Cart (steppers, selected rooms, total) | `Screenshot 2026-06-23 161915.png` |
| 6   | Payment (forma + Reservation Summary)               | `Screenshot 2026-06-23 161930.png` |
| 7   | Payment (scroll / mobilni nastavak)                 | `Screenshot 2026-06-23 161935.png` |
| 8   | Confirmation (potvrda rezervacije)                  | `Screenshot 2026-06-23 161958.png` |

Svaki ekran ima **desktop** i **mobilni (Small)** varijantu na istoj slici
(levo desktop, desno mobilni panel) → dizajn je responsive po definiciji.

---

## Vizuelni jezik (iz slika)

- **Boje:** monohromatski. Crna `~#1A1A1A` (dugmad, check-in dan, aktivni tab),
  bela pozadina, sive linije/sekundarni tekst. **Zeleni** akcent SAMO na
  Confirmation (uspeh) — naslov i reservation number.
- **Tipografija:** serif za velike naslove (npr. "Palace Elisabeth",
  "Congratulations on your choice"), sans-serif za ostalo (labele uppercase,
  sitne, proređene).
- **Dugmad:** pravougaona, crna pozadina, beli uppercase tekst
  (`CONFIRM`, `CONFIRM RESERVATION`, `SELECT`, `GO BACK TO HOMEPAGE`).
- **Stepper (gore):** Accommodation → Payment → Confirmation (krugovi sa brojem,
  čekiran = popunjen). NAPOMENA: na Confirmation slici stepper glasi
  Accommodation → Extras → Confirmation — neusklađenost u Figmi; uskladiti na
  jednu varijantu (predlog: Accommodation → Payment → Confirmation).

---

## Detalji po ekranu

### 1. ChooseAccommodation

- Modal preko background slike (desktop) / pun panel (mobilni).
- Naslov "ACCOMMODATION", X za zatvaranje.
- Lista hotela, svaki: ime (serif) + tip ispod ("Four Heritage Hotel",
  "Four Island Resort"...). Stavke: Palace Elisabeth, Adriana, Amfora,
  Beach Bay, Pharos, Sirena, + "See All Hotels".
- Klik na hotel → otvara ChooseDates.

### 2. ChooseDates

- Modal "DATES", X.
- Dva meseca pored (desktop: March + April), strelica za sledeći mesec.
- Svaki dan: broj + cena ispod (`100€`). Dani imaju stanja (vidi legendu).
- **Legenda:** Available, Unavailable (sivo/disabled), Check-in (crni krug levo),
  Check-out (crni krug desno), Check-out only.
- Footer: "5 NIGHTS" + raspon "2 Apr - 6 Apr 2024" + dugme **CONFIRM**.
- Mobilni: meseci vertikalno, skrol.

### 3. ChooseDates / Legend

- Isto kao 2, ali legenda kao mali popup ("DATE LEGEND") sa X.

### 4. ChooseRoom (lista)

- Header "2 ROOMS AVAILABLE", tabovi: Accommodation / Extras / Confirmation.
- Lista soba: slika sobe, ime ("Deluxe Suite, Sea View"), badge.
- Po sobi više **rate opcija**: "Best Available Rate", "All About You" — svaka sa
  opisom (Bed & Breakfast, uslovi otkazivanja...), cenom (npr. `4.748,00 €`) i
  dugmetom **SELECT**.

### 5. ChooseRoom / Cart (detalj + korpa)

- Leva strana: galerija sobe + izbor.
- Po sobi: **stepper za Adults / Children** (− broj +).
- Više soba: "Deluxe Suite, Sea View", "Premium Room, City View".
- Rate opcije: Best Available Rate, All About You, Weekly Rate.
- Desno: **SELECTED ROOMS** sa cenama, **Total** po sobi i ukupno.
- "ADD MORE ROOMS" dugme. Dno: Total + Continue.

### 6. Payment

- Stepper: Accommodation → **Payment** → Confirmation.
- Naslov "Payment".
- **GUEST DETAILS:** E-mail, First name, Last name, Contact number
  (country code dropdown `HR +385` + broj), Additional comments (textarea).
- **PAYMENT METHOD:** Card number, Expiration date (`MM/YY`), CVV,
  Card holder first name, Card holder last name.
- Checkbox-ovi: Newsletter/promo, "I have read and agree to the terms of use".
- Dugme **CONFIRM RESERVATION** (crno, puna širina).
- "ACCEPTED CREDIT CARDS": Amex, Visa, Maestro, Mastercard, Diners, Discover.
- **Desno RESERVATION SUMMARY:** Palace Elisabeth, datumi, po sobi (ime, rate,
  Bed & Breakfast, Adults/Children, Room Price, Extras: Transfer..., Total),
  i veliki **Total** na dnu.
- Mobilni: summary se prebacuje ispod/na dno, sve u jednu kolonu.

### 7. Payment (nastavak / mobilni)

- Skrol nastavak ekrana 6 (isti elementi).

### 8. Confirmation

- Stepper završen.
- Kartica: slika + zeleni ✓ "Your reservation is confirmed!",
  "Congratulations on your choice, 27 days until your arrival.",
  "Reservation number **SH998375899**" (zeleno).
- **GUEST DETAILS:** Guest (John Doe), E-mail, Contact number.
- **RESERVATION DETAILS:** Check-in, Check-out, Number of nights, Hotel,
  Room 1, Room 2, Number of guests (4 adults, 2 children), Total (5.898,80€).
- Dugme **GO BACK TO HOMEPAGE**.
