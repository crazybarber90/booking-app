import { Button } from "@/components/ui/button";
import type { AvailableRate } from "@/types";
import { formatPrice } from "@/lib/format";
import { boardTypeLabel } from "../board-type";

interface RateOptionProps {
  rate: AvailableRate;
  nights: number;
  disabled?: boolean;
  onSelect: (rate: AvailableRate) => void;
}

/**
 * Glupa komponenta: jedan rate plan kao red pune širine — opis levo
 * (naziv + pansion + cena/noć), cena i SELECT desno.
 */
export function RateOption({ rate, nights, disabled, onSelect }: RateOptionProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{rate.rateName}</span>
        <span className="text-xs text-muted-foreground">
          {boardTypeLabel(rate.boardType)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatPrice(rate.pricePerNight)} po noći
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="text-right">
          <div className="text-base font-semibold">{formatPrice(rate.totalPrice)}</div>
          <div className="text-xs text-muted-foreground">
            {nights} {nights === 1 ? "noć" : "noći"}
          </div>
        </div>
        <Button size="sm" disabled={disabled} onClick={() => onSelect(rate)}>
          {disabled ? "SOLD OUT" : "SELECT"}
        </Button>
      </div>
    </div>
  );
}
