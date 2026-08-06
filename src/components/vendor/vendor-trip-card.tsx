import Link from "next/link";
import { Button } from "@/components/ui/button";

type VendorTripCardTrip = {
  id: string;
  title: string;
  category: string;
  basePrice: number;
  _count: { bookings: number };
};

export function VendorTripCard({ trip }: { trip: VendorTripCardTrip }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="font-heading text-base font-bold text-foreground">{trip.title}</p>
        <p className="mt-1 text-xs text-muted-foreground capitalize">{trip.category.replace("-", " ")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {trip._count.bookings} booking{trip._count.bookings === 1 ? "" : "s"} · ₹
          {trip.basePrice.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/vendor/trips/${trip.id}/bookings`}>Bookings</Link>} />
        <Button variant="secondary" size="sm" render={<Link href={`/vendor/trips/${trip.id}/edit`}>Edit</Link>} />
      </div>
    </div>
  );
}
