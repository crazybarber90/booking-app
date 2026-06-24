import { ChevronLeft, Waves } from "lucide-react";
import { Stepper } from "./stepper";

interface WizardHeaderProps {
  current: number;
  onBack?: () => void;
}

/**
 * Glupa komponenta: zaglavlje wizard-a (koraci 4–5). Crna traka sa BACK + logo,
 * pa stepper na beloj pozadini ispod. `onBack` opcioni (Confirmation ga nema).
 */
export function WizardHeader({ current, onBack }: WizardHeaderProps) {
  return (
    <header>
      <div className="relative flex items-center justify-center bg-primary px-4 py-3 text-primary-foreground">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 flex items-center gap-1 text-sm font-medium uppercase tracking-wide hover:opacity-80"
          >
            <ChevronLeft className="size-4" /> Back
          </button>
        )}
        <Waves className="size-6" />
      </div>
      <div className="border-b border-border bg-background py-3">
        <Stepper current={current} />
      </div>
    </header>
  );
}
