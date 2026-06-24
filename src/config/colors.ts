/**
 * Centralna paleta boja aplikacije ("single source of truth").
 *
 * Pravilo:
 * - SEMANTIC tokeni (background, primary, ...) su mapirani na CSS varijable
 *   definisane u `src/app/globals.css` i koriste se kroz Tailwind klase
 *   (npr. `bg-primary`, `text-muted-foreground`). NE diraj ih ovde direktno —
 *   menjaj vrednosti u globals.css.
 * - BRAND boje su konkretne HEX vrednosti iz Figme. Popuni ih kad otključaš
 *   Figma Dev Mode. Koristi ih za stvari koje nisu pokrivene shadcn temom.
 *
 * Cilj: nigde u komponentama ne pišemo "hardkodovane" hex boje — uvek se
 * referišemo na ovu konstantu ili na Tailwind semantic klasu.
 */

/** Brand boje iz Figme — POPUNITI. Trenutno placeholderi. */
export const brand = {
  /** Glavna akcentna boja (npr. dugmad "CONFIRM RESERVATION") */
  primary: "#1A1A1A",
  /** Sekundarna / hover */
  primaryHover: "#333333",
  /** Zlatna / accent linija u hotel karticama (primer iz Figme) */
  gold: "#C8A971",
  /** Cena / istaknuti tekst */
  price: "#0F766E",
} as const;

/** Statusne boje (validacija forme, toast poruke). */
export const status = {
  success: "#16A34A",
  error: "#DC2626",
  warning: "#D97706",
  info: "#2563EB",
} as const;

/**
 * Semantic tokeni — ogledalo CSS varijabli iz globals.css.
 * Koristi PRVENSTVENO Tailwind klase (`bg-card`, `text-primary`...).
 * Ova mapa je tu samo kad ti zatreba boja u JS-u (npr. chart, inline style).
 */
export const token = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  destructive: "var(--destructive)",
  border: "var(--border)",
  ring: "var(--ring)",
} as const;

export const colors = { brand, status, token } as const;
export default colors;
