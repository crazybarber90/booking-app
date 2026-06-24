import { format, parseISO } from "date-fns";
import type { CartItem } from "@/store/booking-store";
import { formatPrice } from "@/lib/format";
import { boardTypeLabel } from "@/features/rooms/board-type";

interface ReservationSummaryProps {
  propertyName: string;
  checkin: string;
  checkout: string;
  nights: number;
  items: CartItem[];
  total: number;
}

/**
 * Glupa komponenta: "Reservation Summary" (desna siva kartica na Payment ekranu).
 * Prikaz iz store-a: hotel, datumi, sobe (cena = unitPrice × quantity), total.
 * Extras iz Figme NE prikazujemo — API ih nema (vidi steps-flow.md).
 */
export function ReservationSummary({
  propertyName,
  checkin,
  checkout,
  nights,
  items,
  total,
}: ReservationSummaryProps) {
  const dateLabel = `${format(parseISO(checkin), "d MMM yyyy")} - ${format(
    parseISO(checkout),
    "d MMM yyyy"
  )} (${nights} ${nights === 1 ? "night" : "nights"})`;

  return (
    <div className="rounded-xl bg-muted/60 p-5">
      <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Reservation summary
      </h2>
      <h3 className="mt-2 font-heading text-2xl">{propertyName}</h3>
      <p className="text-sm text-muted-foreground">{dateLabel}</p>

      <div className="mt-4 flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={item.id} className="border-t border-border pt-3">
            <div className="text-sm font-semibold">
              Room {i + 1}: {item.unitName}
            </div>
            <div className="text-xs text-muted-foreground">
              {item.rateName} · {boardTypeLabel(item.boardType)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Adults: {item.adults} &nbsp; Children: {item.children} &nbsp;
              Rooms: {item.quantity}
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Room price</span>
              <span>{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="font-heading text-lg">Total</span>
        <span className="font-heading text-lg">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
