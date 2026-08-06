import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TripForm } from "@/components/vendor/trip-form";

export default async function NewVendorTripPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Add a trip</h1>
      <div className="mt-6">
        <TripForm mode="create" />
      </div>
    </div>
  );
}
