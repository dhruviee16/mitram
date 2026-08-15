import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listUsers } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";
import { UserRoleActions } from "@/components/admin/user-role-actions";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

const ROLE_VARIANT: Record<string, "default" | "secondary"> = {
  admin: "default",
};

type UserRow = Awaited<ReturnType<typeof listUsers>>[number];

export default async function AdminUsersPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const users = await listUsers();

  const columns: DataTableColumn<UserRow>[] = [
    {
      header: "User",
      cell: (u) => (
        <div>
          <p className="font-heading font-bold text-foreground">{u.name}</p>
          <p className="text-xs text-muted-foreground">
            {u.email} {u.phone ? `· ${u.phone}` : ""}
          </p>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (u) => <Badge variant={ROLE_VARIANT[u.role] ?? "secondary"}>{u.role}</Badge>,
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (u) => (u.id === session?.user?.id ? null : <UserRoleActions id={u.id} role={u.role} />),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/users" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">Grant or remove admin access.</p>

      <div className="mt-6">
        <DataTable columns={columns} data={users} rowKey={(u) => u.id} emptyMessage="No users yet." />
      </div>
    </div>
  );
}
