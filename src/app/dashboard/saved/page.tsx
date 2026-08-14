import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listSavedTrips } from "@/server/services/savedTripService";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { TripCard } from "@/components/trip/trip-card";
import { Button } from "@/components/ui/button";

export default async function SavedTripsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/customer/login");

  const saved = await listSavedTrips(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <DashboardNav active="/dashboard/saved" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Saved Trips</h1>

      {saved.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Your next journey could start here.</p>
          <Button className="mt-4" render={<Link href="/trips">Explore trips</Link>} />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2" role="list">
          {saved.map((row) => (
            <li key={row.id}>
              <TripCard trip={row.trip} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
