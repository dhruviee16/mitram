import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBookingForVendorUpdate } from "@/server/services/vendorService";
import { TripUpdateForm } from "@/components/vendor/trip-update-form";

export default async function VendorBookingUpdatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/vendor/login");
  }

  const { id } = await params;

  let booking;
  try {
    booking = await getBookingForVendorUpdate(id, session.user.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link
        href={`/vendor/trips/${booking.trip.id}/bookings`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Bookings
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
        {booking.trip.title} — {booking.user.name}
      </h1>
      {booking.status !== "ongoing" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Updates can only be posted while this booking is ongoing.
        </p>
      ) : (
        <div className="mt-6">
          <TripUpdateForm bookingId={booking.id} />
        </div>
      )}

      {booking.tripUpdates.length > 0 && (
        <ol className="mt-8 space-y-3">
          {booking.tripUpdates.map((update) => (
            <li key={update.id} className="border-l-2 border-primary/30 pl-3 text-sm">
              <p className="font-semibold text-foreground">{update.locationLabel}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(update.timestamp).toLocaleString("en-IN")}
              </p>
              {update.note && <p className="mt-1 text-muted-foreground">{update.note}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
