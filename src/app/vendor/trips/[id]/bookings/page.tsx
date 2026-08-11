import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listBookingsForVendorTrip } from "@/server/services/vendorService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function VendorTripBookingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/login");
  }

  const { id } = await params;

  let bookings;
  try {
    bookings = await listBookingsForVendorTrip(id, session.user.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/vendor/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Your trips
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Bookings</h1>

      {bookings.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="font-semibold text-foreground">{booking.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.numTravelers} traveler{booking.numTravelers === 1 ? "" : "s"} · ₹
                  {booking.totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {booking.status}
                </Badge>
                {booking.status === "ongoing" && (
                  <Button
                    size="sm"
                    render={<Link href={`/vendor/bookings/${booking.id}/updates`}>Post update</Link>}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
