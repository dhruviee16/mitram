import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TripForm } from "@/components/vendor/trip-form";
import { listDestinations } from "@/server/services/destinationService";

export default async function NewVendorTripPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/vendor/login");
  }

  const destinations = await listDestinations();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/vendor/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Your trips
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Add a trip</h1>
      <div className="mt-6">
        <TripForm mode="create" destinations={destinations} />
      </div>
    </div>
  );
}
