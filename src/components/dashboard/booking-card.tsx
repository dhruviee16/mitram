import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=400&q=70";

type BookingCardBooking = {
  id: string;
  status: string;
  roomType: string;
  totalAmount: number;
  trip: {
    title: string;
    routeSummary: string;
    images: string[];
  };
};

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  ongoing: "default",
  upcoming: "secondary",
  pending: "secondary",
  completed: "secondary",
  cancelled: "destructive",
};

export function BookingCard({ booking }: { booking: BookingCardBooking }) {
  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className="flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md">
        <Image
          src={booking.trip.images[0] ?? FALLBACK_IMAGE}
          alt={booking.trip.title}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-heading text-base font-bold text-foreground">{booking.trip.title}</p>
          <Badge variant={statusVariant[booking.status] ?? "secondary"} className="capitalize shrink-0">
            {booking.status}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{booking.trip.routeSummary}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="capitalize text-muted-foreground">{booking.roomType} room</span>
          <span className="font-heading font-bold text-primary">
            ₹{booking.totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
        {booking.status === "ongoing" && (
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary">
            <MapPin className="size-3.5" aria-hidden="true" />
            Live tracking available
          </p>
        )}
      </div>
    </Link>
  );
}
