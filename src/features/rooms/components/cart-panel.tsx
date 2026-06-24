import { Button } from "@/components/ui/button";
import type { CartItem as CartItemData } from "@/store/booking-store";
import { formatPrice } from "@/lib/format";
import { CartItem } from "./cart-item";

interface CartPanelProps {
  items: CartItemData[];
  total: number;
  /** Maks. broj soba po stavci (id → max), zbog dostupnosti. */
  maxQuantities: Record<string, number>;
  onChangeItem: (id: string, patch: Partial<CartItemData>) => void;
  onRemoveItem: (id: string) => void;
  onContinue: () => void;
}

/** Glupa komponenta: korpa (lista soba + ukupno + CONTINUE). */
export function CartPanel({
  items,
  total,
  maxQuantities,
  onChangeItem,
  onRemoveItem,
  onContinue,
}: CartPanelProps) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Selected rooms
      </h2>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Korpa je prazna — izaberi sobu.
        </p>
      ) : (
        <div className="mt-2">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              maxQuantity={maxQuantities[item.id] ?? item.quantity}
              onChange={(patch) => onChangeItem(item.id, patch)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium">Total</span>
        <span className="font-heading text-lg">{formatPrice(total)}</span>
      </div>

      <Button
        size="lg"
        className="mt-4 w-full"
        disabled={items.length === 0}
        onClick={onContinue}
      >
        CONTINUE
      </Button>
    </div>
  );
}
