import { cn } from "@/lib/utils";
import { formatPriceCompact } from "@/lib/format";

interface CalendarDayProps {
  day: number;
  price: number | null;
  disabled: boolean;
  /** Deo izabranog opsega (crna traka). */
  selected: boolean;
  /** Levi/desni kraj trake → zaobljen ugao (pill efekat). */
  roundLeft: boolean;
  roundRight: boolean;
  onSelect: () => void;
}

/**
 * Glupa komponenta: jedna ćelija kalendara (broj dana + cena ispod).
 * Izabrani opseg se crta kao neprekidna crna traka (svi dani između check-in i
 * check-out), sa zaobljenim krajevima.
 */
export function CalendarDay({
  day,
  price,
  disabled,
  selected,
  roundLeft,
  roundRight,
  onSelect,
}: CalendarDayProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex h-12 flex-col items-center justify-center text-sm",
        !disabled && !selected && "hover:bg-muted",
        selected && "bg-primary text-primary-foreground",
        roundLeft && "rounded-l-full",
        roundRight && "rounded-r-full",
        disabled && "cursor-not-allowed text-muted-foreground/40"
      )}
    >
      <span className="font-medium leading-none">{day}</span>
      <span className="mt-0.5 text-[10px] leading-none opacity-80">
        {price !== null ? formatPriceCompact(price) : "—"}
      </span>
    </button>
  );
}
