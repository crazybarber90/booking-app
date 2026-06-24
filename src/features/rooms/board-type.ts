import type { BoardType } from "@/types";

/** Čitljiv naziv pansiona iz koda (BB -> Bed & Breakfast). */
const LABELS: Record<string, string> = {
  RO: "Room Only",
  BB: "Bed & Breakfast",
  HB: "Half Board",
  FB: "Full Board",
  AI: "All Inclusive",
};

export function boardTypeLabel(code: BoardType): string {
  return LABELS[code] ?? code;
}
