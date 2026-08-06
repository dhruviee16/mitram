import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getTripForVendor } from "@/server/services/vendorService";
import { TripForm } from "@/components/vendor/trip-form";

export default async function EditVendorTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/login");
  }

  const { id } = await params;

  let trip;
  try {
    trip = await getTripForVendor(id, session.user.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Edit trip</h1>
      <div className="mt-6">
        <TripForm
          mode="edit"
          tripId={trip.id}
          defaultValues={{
            title: trip.title,
            category: trip.category,
            routeSummary: trip.routeSummary,
            durationDays: trip.durationDays,
            durationNights: trip.durationNights,
            basePrice: trip.basePrice,
            images: trip.images.join("\n"),
            careFeatures: trip.careFeatures.join("\n"),
            inclusions: trip.inclusions.join("\n"),
            summary: trip.summary,
            days: trip.days.map((d) => ({
              dayNumber: d.dayNumber,
              title: d.title,
              description: d.description,
              activities: d.activities.join("\n"),
            })),
          }}
        />
      </div>
    </div>
  );
}
