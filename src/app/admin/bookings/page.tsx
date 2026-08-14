import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listAllBookings } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  ongoing: "default",
  upcoming: "secondary",
  pending: "secondary",
  completed: "secondary",
  cancelled: "destructive",
};

type BookingRow = Awaited<ReturnType<typeof listAllBookings>>[number];

export default async function AdminBookingsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const bookings = await listAllBookings();

  const columns: DataTableColumn<BookingRow>[] = [
    {
      header: "Traveller",
      cell: (b) => (
        <div>
          <p className="font-medium text-foreground">{b.user.name}</p>
          <p className="text-xs text-muted-foreground">{b.user.email}</p>
        </div>
      ),
    },
    { header: "Trip", cell: (b) => b.trip.title },
    {
      header: "Status",
      cell: (b) => <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{b.status}</Badge>,
    },
    {
      header: "Payment",
      cell: (b) => <span className="capitalize">{b.payment?.status ?? "pending"}</span>,
    },
    {
      header: "Amount",
      headerClassName: "text-right",
      className: "text-right",
      cell: (b) => `₹${b.totalAmount.toLocaleString("en-IN")}`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/bookings" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Bookings</h1>

      <div className="mt-6">
        <DataTable columns={columns} data={bookings} rowKey={(b) => b.id} emptyMessage="No bookings yet." />
      </div>
    </div>
  );
}
