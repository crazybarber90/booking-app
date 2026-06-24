import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Accommodation", "Payment", "Confirmation"];

interface StepperProps {
  /** 0-based indeks aktivnog koraka. */
  current: number;
}

/**
 * Glupa komponenta: horizontalni stepper (Accommodation → Payment → Confirmation).
 * Prošli koraci = ✓, tekući = pun krug sa brojem, budući = obris.
 */
export function Stepper({ current }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-xs",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs uppercase tracking-wide sm:inline",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="h-px w-6 bg-border sm:w-10" />
            )}
          </div>
        );
      })}
    </div>
  );
}
