import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listVendors } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";
import { StatusActionButtons } from "@/components/admin/status-action-buttons";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  verified: "default",
  pending: "secondary",
  under_review: "secondary",
  rejected: "destructive",
  suspended: "destructive",
};

type VendorRow = Awaited<ReturnType<typeof listVendors>>[number];

export default async function AdminVendorsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const vendors = await listVendors();

  const columns: DataTableColumn<VendorRow>[] = [
    {
      header: "Business",
      cell: (v) => (
        <div>
          <p className="font-heading font-bold text-foreground">{v.businessName}</p>
          <p className="text-xs text-muted-foreground">
            {v.ownerName} · {v.user.email} {v.user.phone ? `· ${v.user.phone}` : ""}
          </p>
          {v.destinationsServed.length > 0 && (
            <p className="text-xs text-muted-foreground">Serves: {v.destinationsServed.join(", ")}</p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (v) => (
        <Badge variant={STATUS_VARIANT[v.verificationStatus] ?? "secondary"}>
          {v.verificationStatus.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (v) => (
        <StatusActionButtons
          endpoint={`/api/admin/vendors/${v.id}`}
          actions={[
            { label: "Verify", status: "verified" },
            { label: "Under review", status: "under_review" },
            { label: "Reject", status: "rejected", variant: "destructive" },
            { label: "Suspend", status: "suspended", variant: "destructive" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/vendors" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Vendor verification</h1>

      <div className="mt-6">
        <DataTable columns={columns} data={vendors} rowKey={(v) => v.id} emptyMessage="No vendors yet." />
      </div>
    </div>
  );
}
