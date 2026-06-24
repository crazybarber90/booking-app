import Image from "next/image";
import { format, parseISO } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

interface ConfirmationViewProps {
  reservationNumber: string;
  daysUntilArrival: number;
  guestName: string;
  email: string;
  phone: string;
  checkin: string;
  checkout: string;
  nights: number;
  hotelName: string;
  rooms: { name: string }[];
  adults: number;
  childrenCount: number;
  total: number;
  onHome: () => void;
}

/** Glupa komponenta: ceo Confirmation prikaz. Sve vrednosti stižu kao props. */
export function ConfirmationView({
  reservationNumber,
  daysUntilArrival,
  guestName,
  email,
  phone,
  checkin,
  checkout,
  nights,
  hotelName,
  rooms,
  adults,
  childrenCount,
  total,
  onHome,
}: ConfirmationViewProps) {
  return (
    <div className="mx-auto max-w-2xl border border-border bg-card">
      <div className="relative h-48 w-full">
        <Image
          src="https://picsum.photos/seed/confirmation-beach/1000/400"
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
        />
      </div>

      <div className="flex flex-col items-center gap-2 border-b border-border p-6 text-center">
        <CheckCircle2 className="size-8 text-success" />
        <p className="text-sm font-medium text-success">
          Your reservation is confirmed!
        </p>
        <h1 className="font-heading text-2xl leading-snug">
          Congratulations on your choice,
          <br />
          {daysUntilArrival} days until your arrival.
        </h1>
        <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
          Reservation number
        </p>
        <p className="font-semibold break-all text-success">{reservationNumber}</p>
      </div>

      <div className="border-b border-border p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Guest details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Detail label="Guest" value={guestName} />
          <Detail label="E-mail" value={email} />
          <Detail label="Contact number" value={phone} />
        </div>
      </div>

      <div className="p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Reservation details
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Detail label="Check-in" value={format(parseISO(checkin), "d MMM yyyy")} />
          <Detail
            label="Check-out"
            value={format(parseISO(checkout), "d MMM yyyy")}
          />
          <Detail label="Number of nights" value={nights} />
          <Detail label="Hotel" value={hotelName} />
          {rooms.map((r, i) => (
            <Detail key={i} label={`Room ${i + 1}`} value={r.name} />
          ))}
          <Detail
            label="Number of guests"
            value={`${adults} adults, ${childrenCount} children`}
          />
          <Detail label="Total" value={formatPrice(total)} />
        </div>
      </div>

      <div className="p-6 pt-0">
        <Button size="lg" className="w-full" onClick={onHome}>
          GO BACK TO HOMEPAGE
        </Button>
      </div>
    </div>
  );
}
