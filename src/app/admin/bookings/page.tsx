import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listAllBookings } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  ongoing: "default",
  upcoming: "secondary",
  pending: "secondary",
  completed: "secondary",
  cancelled: "destructive",
};

export default async function AdminBookingsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const bookings = await listAllBookings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/bookings" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Bookings</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Traveller</th>
              <th className="px-4 py-2.5">Trip</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Payment</th>
              <th className="px-4 py-2.5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-foreground">{b.user.name}</p>
                  <p className="text-xs text-muted-foreground">{b.user.email}</p>
                </td>
                <td className="px-4 py-2.5 text-foreground">{b.trip.title}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{b.status}</Badge>
                </td>
                <td className="px-4 py-2.5 text-foreground capitalize">{b.payment?.status ?? "pending"}</td>
                <td className="px-4 py-2.5 text-foreground">₹{b.totalAmount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
