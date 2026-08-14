import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listVendors } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";
import { StatusActionButtons } from "@/components/admin/status-action-buttons";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  verified: "default",
  pending: "secondary",
  under_review: "secondary",
  rejected: "destructive",
  suspended: "destructive",
};

export default async function AdminVendorsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const vendors = await listVendors();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/vendors" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Vendor verification</h1>

      <ul className="mt-6 space-y-3" role="list">
        {vendors.map((v) => (
          <li key={v.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-heading text-base font-bold text-foreground">{v.businessName}</p>
                  <Badge variant={STATUS_VARIANT[v.verificationStatus] ?? "secondary"}>
                    {v.verificationStatus.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {v.ownerName} · {v.user.email} {v.user.phone ? `· ${v.user.phone}` : ""}
                </p>
                {v.businessAddress && <p className="mt-1 text-xs text-muted-foreground">{v.businessAddress}</p>}
                {v.destinationsServed.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">Serves: {v.destinationsServed.join(", ")}</p>
                )}
              </div>
              <StatusActionButtons
                endpoint={`/api/admin/vendors/${v.id}`}
                actions={[
                  { label: "Verify", status: "verified" },
                  { label: "Under review", status: "under_review" },
                  { label: "Reject", status: "rejected", variant: "destructive" },
                  { label: "Suspend", status: "suspended", variant: "destructive" },
                ]}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
