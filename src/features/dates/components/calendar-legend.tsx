import { cn } from '@/lib/utils'
import { formatPriceCompact } from '@/lib/format'

interface LegendItem {
  label: string
  /** Stil mini-ćelije koji odgovara stanju dana u kalendaru. */
  cellClass: string
}

const ITEMS: LegendItem[] = [
  {
    label: 'Available',
    cellClass: 'border border-border bg-background text-foreground',
  },
  { label: 'Unavailable', cellClass: 'bg-muted text-muted-foreground/50' },
  {
    label: 'Check-in',
    cellClass: 'rounded-l-full bg-primary text-primary-foreground',
  },
  {
    label: 'Check-out',
    cellClass: 'rounded-r-full bg-primary text-primary-foreground',
  },
  {
    label: 'Check-out only',
    cellClass: 'border border-border bg-muted/40 text-muted-foreground',
  },
]

/**
 * Glupa komponenta: legenda stanja dana — svaka stavka je mini-ćelija
 * ("01 / 100 €") stilizovana kao taj tip dana, sa nazivom ispod.
 * Sitnije na telefonu, malo veće od `sm` naviše.
 */
export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-4 sm:gap-x-5 sm:gap-y-4">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1">
          <div
            className={cn(
              'flex h-7 w-7 flex-col items-center justify-center sm:h-9 sm:w-9',
              item.cellClass,
            )}
          >
            <span className="text-[8px] font-semibold leading-none sm:text-[10px]">
              01
            </span>
            <span className="mt-px text-[6px] leading-none opacity-80 sm:text-[8px]">
              {formatPriceCompact(100)}
            </span>
          </div>
          <span className="max-w-13 text-center text-[9px] leading-tight text-muted-foreground sm:max-w-none sm:text-xs">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
