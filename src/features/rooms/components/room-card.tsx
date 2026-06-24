import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AvailableRate, AvailableUnit } from "@/types";
import { RateOption } from "./rate-option";

interface RoomCardProps {
  unit: AvailableUnit;
  /** Ime i slika dolaze iz /units (spojeno po unitId u containeru). */
  name: string;
  image: string;
  /** Preostalo slobodnih (unitsAvailable − već u korpi). 0 = sold out. */
  remaining: number;
  /** Broj noći (za prikaz cene po rate-u). */
  nights: number;
  onSelectRate: (unit: AvailableUnit, rate: AvailableRate) => void;
}

/**
 * Glupa komponenta: jedna soba. Gore slika + ime + „rooms left"; ispod, pune
 * širine, lista rate planova (kao u dizajnu).
 */
export function RoomCard({
  unit,
  name,
  image,
  remaining,
  nights,
  onSelectRate,
}: RoomCardProps) {
  const soldOut = remaining <= 0;

  return (
    <Card className="overflow-hidden p-0">
      {/* Gore: slika + ime + dostupnost */}
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-56 w-full shrink-0 sm:h-auto sm:w-2/5">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-4 p-6">
          <h3 className="font-heading text-2xl">{name}</h3>
          <div className="flex flex-col gap-0.5">
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                soldOut ? "text-destructive" : "text-orange-600"
              )}
            >
              {soldOut ? "Sold out" : `${remaining} rooms left`}
            </span>
            <span className="text-xs text-muted-foreground">
              Do {unit.occupancy.max} gostiju
            </span>
          </div>
        </div>
      </div>

      {/* Ispod: rate planovi pune širine */}
      <div className="border-t border-border px-6">
        {unit.rates.map((rate) => (
          <RateOption
            key={rate.rateId}
            rate={rate}
            nights={nights}
            disabled={soldOut}
            onSelect={(r) => onSelectRate(unit, r)}
          />
        ))}
      </div>
    </Card>
  );
}
