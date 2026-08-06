import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listTripsForVendor, getVendorEarnings } from "@/server/services/vendorService";
import { VendorTripCard } from "@/components/vendor/vendor-trip-card";
import { Button } from "@/components/ui/button";

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/login");
  }

  const [trips, earnings] = await Promise.all([
    listTripsForVendor(session.user.id),
    getVendorEarnings(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Your trips</h1>
        <Button render={<Link href="/vendor/trips/new">Add trip</Link>} />
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Total earnings (paid bookings)</p>
        <p className="mt-1 font-heading text-2xl font-bold text-primary">
          ₹{earnings.toLocaleString("en-IN")}
        </p>
      </div>

      {trips.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          You haven&apos;t added a trip yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {trips.map((trip) => (
            <li key={trip.id}>
              <VendorTripCard trip={trip} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
