import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTripForVendor } from "@/server/services/vendorService";
import { listDestinations } from "@/server/services/destinationService";
import { TripForm } from "@/components/vendor/trip-form";

export default async function EditVendorTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "vendor" && role !== "admin")) {
    redirect("/vendor/login");
  }

  const { id } = await params;

  let trip;
  try {
    trip = await getTripForVendor(id, session.user.id);
  } catch {
    notFound();
  }

  const destinations = await listDestinations();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href={role === "admin" ? "/admin/trips" : "/vendor/dashboard"}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {role === "admin" ? "All trips" : "Your trips"}
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Edit trip</h1>
      <div className="mt-6">
        <TripForm
          mode="edit"
          tripId={trip.id}
          destinations={destinations}
          redirectTo={role === "admin" ? "/admin/trips" : "/vendor/dashboard"}
          defaultValues={{
            title: trip.title,
            category: trip.category.slug,
            destinationId: trip.destinationId ?? "",
            routeSummary: trip.routeSummary,
            durationDays: trip.durationDays,
            durationNights: trip.durationNights,
            basePrice: trip.basePrice,
            images: trip.images,
            careFeatures: trip.careFeatures.join("\n"),
            inclusions: trip.inclusions.join("\n"),
            exclusions: trip.exclusions.join("\n"),
            summary: trip.summary,
            walkingIntensity: trip.walkingIntensity,
            groupSizeMin: trip.groupSizeMin ?? undefined,
            groupSizeMax: trip.groupSizeMax ?? undefined,
            ageGroupMin: trip.ageGroupMin ?? undefined,
            ageGroupMax: trip.ageGroupMax ?? undefined,
            hotelCategory: trip.hotelCategory ?? undefined,
            mealsPlan: trip.mealsPlan,
            insuranceIncluded: trip.insuranceIncluded,
            coordinatorIncluded: trip.coordinatorIncluded,
            accessibilityNotes: trip.accessibilityNotes ?? "",
            days: trip.days.map((d) => ({
              dayNumber: d.dayNumber,
              title: d.title,
              description: d.description,
              activities: d.activities.join("\n"),
            })),
            dates:
              trip.dates.length > 0
                ? trip.dates.map((d) => ({
                    departureDate: d.departureDate.toISOString().slice(0, 10),
                    seatsTotal: d.seatsTotal ?? 20,
                  }))
                : [{ departureDate: "", seatsTotal: 20 }],
          }}
        />
      </div>
    </div>
  );
}
