import { notFound } from "next/navigation";
import { PhotoHeader } from "@/components/trip-detail/photo-header";
import { ItinerarySection } from "@/components/trip-detail/itinerary-section";
import { BookingBox } from "@/components/trip-detail/booking-box";
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
    <div className="pb-36 lg:pb-10">
      <PhotoHeader
        title={trip.title}
        routeSummary={trip.routeSummary}
        durationDays={trip.durationDays}
        durationNights={trip.durationNights}
        category={trip.category}
        images={trip.images}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0">
            <ItinerarySection
              days={trip.days}
              summary={trip.summary}
              inclusions={trip.inclusions}
              careFeatures={trip.careFeatures}
            />
          </div>
          <BookingBox
            slug={trip.slug}
            basePrice={trip.basePrice}
            durationDays={trip.durationDays}
            durationNights={trip.durationNights}
            inclusions={trip.inclusions}
            careFeatures={trip.careFeatures}
          />
        </div>
      </div>
    </div>
  );
}
