import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminOverview } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminOverviewPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const overview = await getAdminOverview();

  const cards = [
    { label: "Vendors pending review", value: overview.pendingVendors },
    { label: "Trips pending approval", value: overview.pendingTrips },
    { label: "Total bookings", value: overview.totalBookings },
    { label: "Registered travellers", value: overview.totalUsers },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin" />
      <h1 className="font-heading text-2xl font-bold text-foreground">MITRAM Operations</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-primary">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
