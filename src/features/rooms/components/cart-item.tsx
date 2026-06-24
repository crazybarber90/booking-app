import { Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { CartItem as CartItemData } from "@/store/booking-store";
import { formatPrice } from "@/lib/format";
import { boardTypeLabel } from "../board-type";
import { QuantityStepper } from "./quantity-stepper";

interface CartItemProps {
  item: CartItemData;
  /** Maksimalan broj soba ovog tipa (po dostupnosti). */
  maxQuantity: number;
  onChange: (patch: Partial<CartItemData>) => void;
  onRemove: () => void;
}

/** Glupa komponenta: jedna stavka korpe (soba + gosti + količina + cena). */
export function CartItem({ item, maxQuantity, onChange, onRemove }: CartItemProps) {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{item.unitName}</div>
          <div className="text-xs text-muted-foreground">
            {item.rateName} · {boardTypeLabel(item.boardType)}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Ukloni sobu"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <QuantityStepper
          label="Odrasli"
          value={item.adults}
          min={1}
          onChange={(v) => onChange({ adults: v })}
        />
        <QuantityStepper
          label="Deca"
          value={item.children}
          min={0}
          onChange={(v) => onChange({ children: v })}
        />
        <QuantityStepper
          label="Soba"
          value={item.quantity}
          min={1}
          max={maxQuantity}
          onChange={(v) => onChange({ quantity: v })}
        />
      </div>

      <div className="mt-2 text-right text-sm font-semibold">{formatPrice(lineTotal)}</div>
      <Separator className="mt-3" />
    </div>
  );
}
