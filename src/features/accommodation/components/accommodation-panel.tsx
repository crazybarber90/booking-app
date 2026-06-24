import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types";
import { PropertyListItem } from "./property-list-item";

interface AccommodationPanelProps {
  properties: readonly Property[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onSelect: (property: Property) => void;
}

/**
 * Glupa komponenta: sadržaj "Accommodation" panela (lista + loading + error).
 * Sva stanja prima kao props; ne fetchuje ništa. Lako se testira u izolaciji.
 */
export function AccommodationPanel({
  properties,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
}: AccommodationPanelProps) {
  return (
    <div className="flex flex-col">
      {isLoading && (
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 border-b border-border py-4 last:border-b-0"
            >
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {errorMessage ?? "Ne mogu da učitam hotele."}
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Pokušaj ponovo
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col">
          {properties.map((property) => (
            <PropertyListItem
              key={property.id}
              property={property}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
