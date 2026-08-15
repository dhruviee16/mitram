import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getBookingById } from "@/server/services/bookingService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ItineraryRecap } from "@/components/dashboard/itinerary-recap";
import { LiveTrackingPanel } from "@/components/dashboard/live-tracking-panel";
import { ReviewForm } from "@/components/dashboard/review-form";
import { StarRating } from "@/components/ui/star-rating";
import { formatRoute } from "@/lib/format-route";

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
          <p className="text-xs text-muted-foreground">{formatRoute(booking.trip.routeSummary)}</p>
          <Badge className="mt-2 capitalize">{booking.status}</Badge>
        </div>
      </div>

      <Card className="mt-6">
      <CardContent>
        <h2 className="text-sm font-semibold text-foreground">
          Traveler{booking.travelers.length === 1 ? "" : "s"}
        </h2>
        <div className="mt-2 space-y-2 text-sm text-foreground">
          {booking.travelers.map((traveler) => (
            <div key={traveler.id}>
              <p>
                {traveler.name}, {traveler.age} · {traveler.relationship}
              </p>
              {traveler.healthNotes.length > 0 && (
                <p className="mt-0.5 text-muted-foreground">
                  Health notes: {traveler.healthNotes.join(", ")}
                </p>
              )}
              {traveler.dietaryNeeds.length > 0 && (
                <p className="text-muted-foreground">
                  Dietary: {traveler.dietaryNeeds.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>

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
          {booking.tripDate && (
            <div>
              <p className="text-muted-foreground">Departure</p>
              <p className="text-foreground">
                {booking.tripDate.departureDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Insurance</p>
            <p className="text-foreground">{booking.insuranceOpted ? "Opted in" : "Not opted"}</p>
          </div>
        </div>

        {booking.specialCareRequests.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Care requests: {booking.specialCareRequests.join(", ")}
          </p>
        )}

        {(booking.emergencyContactName || booking.familyConnection) && (
          <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            {booking.emergencyContactName && (
              <p className="text-foreground">
                Emergency contact: {booking.emergencyContactName} ({booking.emergencyContactRelation}) ·{" "}
                {booking.emergencyContactPhone}
              </p>
            )}
            {booking.familyConnection && (
              <p className="text-foreground">
                Family contact: {booking.familyConnection.name} ({booking.familyConnection.relationship})
              </p>
            )}
          </div>
        )}
      </CardContent>
      </Card>

      <div className="mt-6">
        <ItineraryRecap days={booking.trip.days} />
      </div>

      {booking.status === "completed" && (
        <div className="mt-6">
          {booking.review ? (
            <Card>
              <CardContent>
                <p className="text-sm font-semibold text-foreground">Your review</p>
                <div className="mt-1.5">
                  <StarRating value={booking.review.rating} readOnly />
                </div>
                {booking.review.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">{booking.review.comment}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <ReviewForm bookingId={booking.id} />
          )}
        </div>
      )}

      {booking.status === "ongoing" ? (
        <LiveTrackingPanel
          bookingId={booking.id}
          trackingVisible={booking.trackingVisible}
          tripUpdates={booking.tripUpdates}
          routeSummary={booking.trip.routeSummary}
        />
      ) : (
        booking.status === "confirmed" && (
          <Card className="mt-6 border-dashed">
            <CardContent className="text-center text-sm text-muted-foreground">
              Live tracking will appear here once the trip starts.
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
