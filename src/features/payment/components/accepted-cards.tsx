import {
  FaCcAmex,
  FaCcDinersClub,
  FaCcDiscover,
  FaCcMastercard,
  FaCcVisa,
} from "react-icons/fa6";

const CARDS = [
  { Icon: FaCcAmex, color: "#2E77BC", label: "Amex" },
  { Icon: FaCcVisa, color: "#1A1F71", label: "Visa" },
  { Icon: FaCcMastercard, color: "#EB001B", label: "Mastercard" },
  { Icon: FaCcDinersClub, color: "#0079BE", label: "Diners" },
  { Icon: FaCcDiscover, color: "#FF6000", label: "Discover" },
];

/** Glupa komponenta: traka "Accepted credit cards" (dno Payment forme). */
export function AcceptedCards() {
  return (
    <div className="bg-muted/60 px-4 py-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Accepted credit cards
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {CARDS.map(({ Icon, color, label }) => (
          <Icon key={label} title={label} size={34} style={{ color }} />
        ))}
      </div>
    </div>
  );
}
