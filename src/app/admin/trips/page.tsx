import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listTripsForApproval } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";
import { StatusActionButtons } from "@/components/admin/status-action-buttons";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  approved: "default",
  pending_approval: "secondary",
  paused: "secondary",
  rejected: "destructive",
};

export default async function AdminTripsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const trips = await listTripsForApproval();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/trips" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Trip approval</h1>

      <ul className="mt-6 space-y-3" role="list">
        {trips.map((trip) => (
          <li key={trip.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-heading text-base font-bold text-foreground">{trip.title}</p>
                  <Badge variant={STATUS_VARIANT[trip.status] ?? "secondary"}>
                    {trip.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trip.category.name} · ₹{trip.basePrice.toLocaleString("en-IN")} · Vendor:{" "}
                  {trip.vendor?.vendorProfile?.businessName ?? trip.vendor?.name ?? "MITRAM"}
                </p>
              </div>
              <StatusActionButtons
                endpoint={`/api/admin/trips/${trip.id}`}
                actions={[
                  { label: "Approve", status: "approved" },
                  { label: "Pause", status: "paused" },
                  { label: "Reject", status: "rejected", variant: "destructive" },
                ]}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
