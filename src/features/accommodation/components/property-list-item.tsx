import { ChevronRight } from "lucide-react";
import type { Property } from "@/types";

/** Čitljiva oznaka tipa objekta: "hotel" -> "Hotel". */
function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

interface PropertyListItemProps {
  property: Property;
  onSelect: (property: Property) => void;
}

/**
 * Glupa komponenta: jedan red u listi hotela. Ime (serif) + tip ispod + strelica.
 * Nema pojma o API-ju ni store-u — samo prikaz i `onSelect` callback.
 */
export function PropertyListItem({ property, onSelect }: PropertyListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(property)}
      className="group flex w-full items-center justify-between gap-4 border-b border-border py-4 text-left transition-colors last:border-b-0 hover:bg-muted/40"
    >
      <span className="flex flex-col gap-0.5">
        <span className="font-heading text-lg leading-tight text-foreground">
          {property.name}
        </span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {formatType(property.type)}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
