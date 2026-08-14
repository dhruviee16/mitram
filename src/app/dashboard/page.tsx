import Link from "next/link";
import { auth } from "@/auth";
import { listBookingsForUser } from "@/server/services/bookingService";
import { BookingCard } from "@/components/dashboard/booking-card";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const bookings = session?.user?.id ? await listBookingsForUser(session.user.id) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <DashboardNav active="/dashboard" />
      <h1 className="font-heading text-2xl font-bold text-foreground">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">You haven&rsquo;t booked a trip yet.</p>
          <Button className="mt-4" render={<Link href="/trips">Explore trips</Link>} />
        </div>
      ) : (
        <ul className="mt-6 space-y-4" role="list">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <BookingCard booking={booking} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
