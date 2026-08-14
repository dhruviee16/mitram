import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listFamilyConnections } from "@/server/services/familyService";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { FamilyConnectionsManager } from "@/components/dashboard/family-connections-manager";

export default async function FamilyConnectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/customer/login");

  const connections = await listFamilyConnections(session.user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <DashboardNav active="/dashboard/family" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Family Connections</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Miles apart. Still connected. Add a family member and control exactly what they can see.
      </p>
      <div className="mt-6">
        <FamilyConnectionsManager
          initialConnections={connections.map((c) => ({
            id: c.id,
            name: c.name,
            relationship: c.relationship,
            email: c.email,
            phone: c.phone,
            tripUpdates: c.tripUpdates,
            arrivalUpdates: c.arrivalUpdates,
            photos: c.photos,
            liveLocation: c.liveLocation,
            emergencyNotifications: c.emergencyNotifications,
          }))}
        />
      </div>
    </div>
  );
}
