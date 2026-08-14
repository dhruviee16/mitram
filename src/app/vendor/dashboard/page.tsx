import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { listTripsForVendor, getVendorAnalytics, getVendorProfile } from "@/server/services/vendorService";
import { VendorTripCard } from "@/components/vendor/vendor-trip-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VERIFICATION_COPY: Record<string, { label: string; icon: typeof ShieldCheck; tone: string }> = {
  pending: { label: "Your application is pending MITRAM review.", icon: ShieldAlert, tone: "border-accent/40 bg-accent/10 text-foreground" },
  under_review: { label: "Your application is under review by MITRAM operations.", icon: ShieldAlert, tone: "border-accent/40 bg-accent/10 text-foreground" },
  verified: { label: "MITRAM Verified Partner.", icon: ShieldCheck, tone: "border-primary/30 bg-secondary/30 text-foreground" },
  rejected: { label: "Your application was not approved. Contact MITRAM support for details.", icon: ShieldX, tone: "border-destructive/30 bg-destructive/10 text-destructive" },
  suspended: { label: "Your partner account is suspended. Contact MITRAM support.", icon: ShieldX, tone: "border-destructive/30 bg-destructive/10 text-destructive" },
};

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/vendor/login");
  }

  const [trips, analytics, vendorProfile] = await Promise.all([
    listTripsForVendor(session.user.id),
    getVendorAnalytics(session.user.id),
    getVendorProfile(session.user.id),
  ]);

  const verification = vendorProfile ? VERIFICATION_COPY[vendorProfile.verificationStatus] : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Your trips</h1>
        <Button render={<Link href="/vendor/trips/new">Add trip</Link>} />
      </div>

      {verification && (
        <Card className={`mt-4 flex-row items-center gap-2.5 ${verification.tone}`} size="sm">
          <CardContent className="flex flex-1 items-center gap-2.5 text-sm">
            <verification.icon className="size-4 shrink-0" aria-hidden="true" />
            {verification.label}
          </CardContent>
        </Card>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card size="sm">
          <CardContent>
            <p className="text-xs text-muted-foreground">Trips</p>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{analytics.tripCount}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-xs text-muted-foreground">Bookings</p>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{analytics.bookingCount}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-xs text-muted-foreground">Conversion</p>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{analytics.conversionRate}%</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-xs text-muted-foreground">Upcoming departures</p>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">{analytics.upcomingDates}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-xs text-muted-foreground">Revenue (paid)</p>
            <p className="mt-1 font-heading text-xl font-bold text-primary">₹{analytics.revenue.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
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
