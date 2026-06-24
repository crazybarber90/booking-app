import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Vraća `false` na serveru i tokom hidracije, `true` posle hidracije na klijentu.
 *
 * Koristi se da sačekamo da Zustand `persist` pročita localStorage pre nego što
 * odlučimo o redirectu — bez `setState` u efektu (što React 19 prijavljuje kao
 * "cascading renders"). `useSyncExternalStore` ima zaseban server snapshot, pa
 * nema ni hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // klijent
    () => false, // server
  )
}

/* Problem koji nastaje bez njega: na zaštićenim rutama radiš
  if (!property) redirect("/"). Na prvom renderu je property
  === null (LS još nije pročitan) → pogrešno te izbaci, iako
  hotel postoji. Plus hydration mismatch (server kaže null,
  klijent kaže hotel).

  Šta useHydrated radi: vrati false na serveru i tokom
  hidracije, true tek posle. Pa u screen-u čekaš: */
