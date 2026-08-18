import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { listDestinations } from "@/server/services/destinationService";
import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type DestinationRow = Awaited<ReturnType<typeof listDestinations>>[number];

export default async function AdminDestinationsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const destinations = await listDestinations();

  const columns: DataTableColumn<DestinationRow>[] = [
    {
      header: "Destination",
      cell: (d) => (
        <div>
          <p className="text-sm font-semibold text-foreground">{d.name}</p>
          {d.state && <p className="text-xs text-muted-foreground">{d.state}</p>}
        </div>
      ),
    },
    {
      header: "Trips",
      cell: (d) => d._count.trips,
    },
    {
      header: "Status",
      cell: (d) =>
        d.heroImage && d.description ? (
          <Badge>Published</Badge>
        ) : (
          <Badge variant="secondary">Needs photo &amp; description</Badge>
        ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (d) => (
        <Button variant="outline" size="sm" render={<Link href={`/admin/destinations/${d.id}`} />}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/destinations" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Destinations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Vendors can add a destination by name only. Add a photo and description here before it
        appears on the homepage or the public destinations page.
      </p>

      <div className="mt-6">
        <DataTable columns={columns} data={destinations} rowKey={(d) => d.id} emptyMessage="No destinations yet." />
      </div>
    </div>
  );
}
