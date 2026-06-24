import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityStepperProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

/** Glupa, reusable komponenta: − vrednost + (broj soba, odraslih, dece). */
export function QuantityStepper({
  label,
  value,
  min = 0,
  max = 99,
  onChange,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      {label && <span className="text-sm">{label}</span>}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label="Smanji"
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="w-6 text-center text-sm tabular-nums">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label="Povećaj"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
