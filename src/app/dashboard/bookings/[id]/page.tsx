import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getBookingById } from "@/server/services/bookingService";
import { Badge } from "@/components/ui/badge";
import { ItineraryRecap } from "@/components/dashboard/itinerary-recap";
import { LiveTrackingPanel } from "@/components/dashboard/live-tracking-panel";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&q=70";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking || booking.userId !== session.user.id) {
    notFound();
  }

  const traveler = booking.travelers[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        My Bookings
      </Link>

      <div className="mt-4 flex gap-4">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md">
          <Image
            src={booking.trip.images[0] ?? FALLBACK_IMAGE}
            alt={booking.trip.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">{booking.trip.title}</h1>
          <p className="text-xs text-muted-foreground">{booking.trip.routeSummary}</p>
          <Badge className="mt-2 capitalize">{booking.status}</Badge>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Traveler</h2>
        {traveler && (
          <div className="mt-2 text-sm text-foreground">
            <p>
              {traveler.name}, {traveler.age} · {traveler.relationship}
            </p>
            {traveler.healthNotes.length > 0 && (
              <p className="mt-1 text-muted-foreground">
                Health notes: {traveler.healthNotes.join(", ")}
              </p>
            )}
            {traveler.dietaryNeeds.length > 0 && (
              <p className="text-muted-foreground">
                Dietary: {traveler.dietaryNeeds.join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Room</p>
            <p className="capitalize text-foreground">{booking.roomType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment</p>
            <p className="capitalize text-foreground">
              ₹{booking.totalAmount.toLocaleString("en-IN")} · {booking.payment?.status ?? "pending"}
            </p>
          </div>
        </div>

        {booking.specialCareRequests.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Care requests: {booking.specialCareRequests.join(", ")}
          </p>
        )}
      </div>

      <div className="mt-6">
        <ItineraryRecap days={booking.trip.days} />
      </div>

      {booking.status === "ongoing" ? (
        <LiveTrackingPanel
          bookingId={booking.id}
          trackingVisible={booking.trackingVisible}
          tripUpdates={booking.tripUpdates}
        />
      ) : (
        booking.status === "confirmed" && (
          <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Live tracking will appear here once the trip starts.
          </p>
        )
      )}
    </div>
  );
}
