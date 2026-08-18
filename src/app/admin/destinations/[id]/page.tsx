import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getDestinationById } from "@/server/services/destinationService";
import { AdminNav } from "@/components/admin/admin-nav";
import { DestinationForm } from "@/components/admin/destination-form";

export default async function AdminEditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const { id } = await params;
  const destination = await getDestinationById(id);
  if (!destination) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/destinations" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Edit destination</h1>

      <div className="mt-6">
        <DestinationForm
          id={destination.id}
          defaultValues={{
            name: destination.name,
            state: destination.state ?? "",
            bestTime: destination.bestTime ?? "",
            description: destination.description ?? "",
            heroImage: destination.heroImage ?? "",
          }}
        />
      </div>
    </div>
  );
}
