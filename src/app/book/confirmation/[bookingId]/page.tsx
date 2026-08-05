import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { getBookingById } from "@/server/services/bookingService";
import { Button } from "@/components/ui/button";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking || booking.userId !== session.user.id) {
    notFound();
  }

  const traveler = booking.travelers[0];

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center sm:px-6">
      <CheckCircle2 className="mx-auto size-12 text-primary" aria-hidden="true" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Booking confirmed</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Booking ID: <span className="font-mono">{booking.id}</span>
      </p>

      <div className="mt-6 rounded-lg border border-border bg-card p-5 text-left">
        <div className="flex gap-3">
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
            <Image
              src={
                booking.trip.images[0] ??
                "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=200&q=70"
              }
              alt={booking.trip.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{booking.trip.title}</p>
            <p className="text-xs text-muted-foreground">{booking.trip.routeSummary}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          {traveler && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Traveler</dt>
              <dd className="text-foreground">{traveler.name}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Room</dt>
            <dd className="text-foreground capitalize">{booking.roomType}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="font-semibold text-foreground">Amount paid</dt>
            <dd className="font-semibold text-primary">
              ₹{booking.totalAmount.toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>
      </div>

      <Button className="mt-6" render={<Link href="/dashboard">View my bookings</Link>} />
    </div>
  );
}
