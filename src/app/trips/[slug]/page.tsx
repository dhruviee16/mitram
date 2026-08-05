import { notFound } from "next/navigation";
import { PhotoHeader } from "@/components/trip-detail/photo-header";
import { ItinerarySection } from "@/components/trip-detail/itinerary-section";
import { getTripBySlug } from "@/server/services/tripService";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  return (
    <div>
      <PhotoHeader
        title={trip.title}
        routeSummary={trip.routeSummary}
        durationDays={trip.durationDays}
        durationNights={trip.durationNights}
        image={trip.images[0]}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <ItinerarySection days={trip.days} summary={trip.summary} inclusions={trip.inclusions} />
      </div>
    </div>
  );
}
