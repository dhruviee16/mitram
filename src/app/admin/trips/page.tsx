import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listTripsForApproval } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";
import { StatusActionButtons } from "@/components/admin/status-action-buttons";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  approved: "default",
  pending_approval: "secondary",
  paused: "secondary",
  rejected: "destructive",
};

type TripRow = Awaited<ReturnType<typeof listTripsForApproval>>[number];

export default async function AdminTripsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const trips = await listTripsForApproval();

  const columns: DataTableColumn<TripRow>[] = [
    {
      header: "Trip",
      cell: (trip) => <span className="font-heading font-bold text-foreground">{trip.title}</span>,
    },
    {
      header: "Category",
      cell: (trip) => trip.category.name,
    },
    {
      header: "Price",
      cell: (trip) => `₹${trip.basePrice.toLocaleString("en-IN")}`,
    },
    {
      header: "Vendor",
      cell: (trip) => trip.vendor?.vendorProfile?.businessName ?? trip.vendor?.name ?? "MITRAM",
    },
    {
      header: "Status",
      cell: (trip) => (
        <Badge variant={STATUS_VARIANT[trip.status] ?? "secondary"}>
          {trip.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (trip) => (
        <StatusActionButtons
          endpoint={`/api/admin/trips/${trip.id}`}
          actions={[
            { label: "Approve", status: "approved" },
            { label: "Pause", status: "paused" },
            { label: "Reject", status: "rejected", variant: "destructive" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/trips" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Trip approval</h1>

      <div className="mt-6">
        <DataTable columns={columns} data={trips} rowKey={(trip) => trip.id} emptyMessage="No trips yet." />
      </div>
    </div>
  );
}
