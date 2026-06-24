/**
 * Formatiranje cena — jedno mesto za prikaz novca.
 *
 * Koristi ugrađeni `Intl.NumberFormat` (bez zavisnosti). Lokal `hr-HR` + EUR
 * daje format iz dizajna: `4.748,00 €`. Prikaz je čisto kozmetika — merodavne
 * iznose daje backend (`booking.totalPrice`); ovde se NIŠTA ne računa.
 */

const eurFull = new Intl.NumberFormat("hr-HR", {
  style: "currency",
  currency: "EUR",
});

const eurCompact = new Intl.NumberFormat("hr-HR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Pun iznos sa decimalama: `4.748,00 €`. Za totale, cene soba i rate planove. */
export const formatPrice = (value: number) => eurFull.format(value);

/** Kompaktan iznos bez decimala: `100 €`. Za sitne ćelije kalendara. */
export const formatPriceCompact = (value: number) => eurCompact.format(value);
