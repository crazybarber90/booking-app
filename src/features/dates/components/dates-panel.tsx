import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { CalendarDay as CalendarDayData } from '@/types'
import { MonthCalendar } from './month-calendar'
import { CalendarLegend } from './calendar-legend'

interface DatesPanelProps {
  /** Ime hotela (za mobilni „Accommodation" tab). */
  propertyName: string
  /** Klik na „Accommodation" tab → nazad na izbor hotela. */
  onChangeAccommodation: () => void
  months: Date[]
  daysMap: Map<string, CalendarDayData>
  checkIn: Date | null
  checkOut: Date | null
  today: Date
  nights: number
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  canGoPrev: boolean
  onPrev: () => void
  onNext: () => void
  onSelect: (date: Date) => void
  onConfirm: () => void
  onClose: () => void
  onRetry: () => void
}

/**
 * Glupa komponenta: ceo "DATES" panel — header, dva meseca sa strelicama,
 * legenda i footer (broj noći + raspon + CONFIRM). Bez ikakve logike.
 */
export function DatesPanel({
  propertyName,
  onChangeAccommodation,
  months,
  daysMap,
  checkIn,
  checkOut,
  today,
  nights,
  isLoading,
  isError,
  errorMessage,
  canGoPrev,
  onPrev,
  onNext,
  onSelect,
  onConfirm,
  onClose,
  onRetry,
}: DatesPanelProps) {
  const canConfirm = nights > 0
  const rangeLabel =
    checkIn && checkOut
      ? `${format(checkIn, 'd MMM yyyy')} - ${format(checkOut, 'd MMM yyyy')}`
      : 'Izaberi datume'

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span className="sm:hidden">Search</span>
          <span className="hidden sm:inline">Dates</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Nazad"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Mobilni tabovi (Accommodation | Dates) — samo na malim ekranima.
          Rute ostaju iste: „Accommodation" samo vodi nazad na izbor hotela. */}
      <div className="flex border-b border-border sm:hidden">
        <button
          type="button"
          onClick={onChangeAccommodation}
          className="flex flex-1 flex-col items-center gap-0.5 py-3"
        >
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Accommodation
          </span>
          <span className="text-xs">{propertyName}</span>
        </button>
        <div className="flex flex-1 flex-col items-center justify-center gap-0.5 border-b-2 border-primary py-3">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Dates
          </span>
        </div>
      </div>

      {/* Telo */}
      <div className="px-2 py-4 sm:px-5 sm:py-5">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {errorMessage ?? 'Ne mogu da učitam kalendar.'}
            </p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Pokušaj ponovo
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onPrev}
                disabled={!canGoPrev}
                className="absolute left-0 top-0"
                aria-label="Prethodni mesec"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onNext}
                className="absolute right-0 top-0"
                aria-label="Sledeći mesec"
              >
                <ChevronRight className="size-4" />
              </Button>

              <div className="grid gap-8 px-8 sm:grid-cols-2">
                {months.map((m) => (
                  <MonthCalendar
                    key={format(m, 'yyyy-MM')}
                    month={m}
                    daysMap={daysMap}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    today={today}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <CalendarLegend />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {nights > 0
              ? `${nights} ${nights === 1 ? 'night' : 'nights'}`
              : '—'}
          </span>
          <span className="text-sm font-medium">{rangeLabel}</span>
        </div>
        <Button size="lg" disabled={!canConfirm} onClick={onConfirm}>
          CONFIRM
        </Button>
      </div>
    </div>
  )
}
