import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { getTripBySlug } from "@/server/services/tripService";

export default async function BookTripPage({
  params,
}: {
  params: Promise<{ tripSlug: string }>;
}) {
  const { tripSlug } = await params;
  const trip = await getTripBySlug(tripSlug);

  if (!trip) {
    notFound();
  }

  return (
    <BookingWizard
      trip={{
        slug: trip.slug,
        title: trip.title,
        routeSummary: trip.routeSummary,
        basePrice: trip.basePrice,
        durationDays: trip.durationDays,
        durationNights: trip.durationNights,
        images: trip.images,
      }}
    />
  );
}
