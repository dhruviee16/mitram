import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { getTripForBooking } from "@/server/services/tripService";

export default async function BookTripPage({
  params,
}: {
  params: Promise<{ tripSlug: string }>;
}) {
  const { tripSlug } = await params;
  const trip = await getTripForBooking(tripSlug);

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
        insuranceIncluded: trip.insuranceIncluded,
        dates: trip.dates.map((d) => ({
          id: d.id,
          departureDate: d.departureDate.toISOString(),
          returnDate: d.returnDate?.toISOString() ?? null,
          seatsAvailable: d.seatsAvailable,
        })),
      }}
    />
  );
}
