import { notFound } from "next/navigation";
import { PhotoHeader } from "@/components/trip-detail/photo-header";
import { QuickInfo } from "@/components/trip-detail/quick-info";
import { ItinerarySection } from "@/components/trip-detail/itinerary-section";
import { IncludesExcludes } from "@/components/trip-detail/includes-excludes";
import { CareLayer } from "@/components/trip-detail/care-layer";
import { CancellationPolicy } from "@/components/trip-detail/cancellation-policy";
import { RelatedTrips } from "@/components/trip-detail/related-trips";
import { CallbackForm } from "@/components/trip-detail/callback-form";
import { BookingBox } from "@/components/trip-detail/booking-box";
import { SaveTripButton } from "@/components/trip-detail/save-trip-button";
import { ReviewsSection } from "@/components/trip-detail/reviews-section";
import { getTripBySlug, getRelatedTrips } from "@/server/services/tripService";
import { isTripSaved } from "@/server/services/savedTripService";
import { listReviewsForTrip, getTripRatingSummary } from "@/server/services/reviewService";
import { auth } from "@/auth";

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

  const session = await auth();
  const [relatedTrips, initialSaved, reviews, ratingSummary] = await Promise.all([
    getRelatedTrips(trip.id, trip.categoryId),
    session?.user?.id ? isTripSaved(session.user.id, trip.id) : Promise.resolve(false),
    listReviewsForTrip(trip.id),
    getTripRatingSummary(trip.id),
  ]);

  return (
    <div className="pb-36 lg:pb-10">
      <PhotoHeader
        title={trip.title}
        routeSummary={trip.routeSummary}
        durationDays={trip.durationDays}
        durationNights={trip.durationNights}
        category={trip.category.name}
        images={trip.images}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0 space-y-6">
            <QuickInfo trip={trip} />
            <IncludesExcludes inclusions={trip.inclusions} exclusions={trip.exclusions} />
            <ItinerarySection
              days={trip.days}
              summary={trip.summary}
              inclusions={trip.inclusions}
              careFeatures={trip.careFeatures}
            />
            <CareLayer trip={trip} />
            <ReviewsSection reviews={reviews} average={ratingSummary.average} count={ratingSummary.count} />
            <CancellationPolicy />
            <RelatedTrips trips={relatedTrips} />
          </div>
          <div className="space-y-4">
            <BookingBox
              slug={trip.slug}
              basePrice={trip.basePrice}
              durationDays={trip.durationDays}
              durationNights={trip.durationNights}
              inclusions={trip.inclusions}
              careFeatures={trip.careFeatures}
            />
            <SaveTripButton tripId={trip.id} initialSaved={initialSaved} />
            <div className="hidden lg:block">
              <CallbackForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
