import { nanoid } from "nanoid";
import { prisma } from "@/server/db";
import type { VendorTripValues, VendorTripUpdateValues } from "@/lib/validations/vendor";

export function listTripsForVendor(vendorId: string) {
  return prisma.trip.findMany({
    where: { vendorId },
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });
}

function slugify(title: string) {
  return `${title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${nanoid(6)}`;
}

export async function createTrip(vendorId: string, input: VendorTripValues) {
  const trip = await prisma.trip.create({
    data: {
      slug: slugify(input.title),
      title: input.title,
      category: input.category,
      routeSummary: input.routeSummary,
      durationDays: input.durationDays,
      durationNights: input.durationNights,
      basePrice: input.basePrice,
      images: input.images,
      careFeatures: input.careFeatures,
      inclusions: input.inclusions,
      summary: input.summary,
      vendorId,
      days: {
        create: input.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          activities: day.activities,
        })),
      },
    },
  });

  return { tripId: trip.id, slug: trip.slug };
}

export async function getTripForVendor(tripId: string, vendorId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { days: { orderBy: { dayNumber: "asc" } } },
  });
  if (!trip || trip.vendorId !== vendorId) {
    throw new Error("Trip not found.");
  }
  return trip;
}

export async function updateTrip(tripId: string, vendorId: string, input: VendorTripValues) {
  const existing = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!existing || existing.vendorId !== vendorId) {
    throw new Error("Trip not found.");
  }

  await prisma.tripDay.deleteMany({ where: { tripId } });

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      title: input.title,
      category: input.category,
      routeSummary: input.routeSummary,
      durationDays: input.durationDays,
      durationNights: input.durationNights,
      basePrice: input.basePrice,
      images: input.images,
      careFeatures: input.careFeatures,
      inclusions: input.inclusions,
      summary: input.summary,
      days: {
        create: input.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          activities: day.activities,
        })),
      },
    },
  });

  return { tripId: trip.id, slug: trip.slug };
}

export async function listBookingsForVendorTrip(tripId: string, vendorId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.vendorId !== vendorId) {
    throw new Error("Trip not found.");
  }

  return prisma.booking.findMany({
    where: { tripId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVendorEarnings(vendorId: string) {
  const result = await prisma.payment.aggregate({
    where: { status: "paid", booking: { trip: { vendorId } } },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getBookingForVendorUpdate(bookingId: string, vendorId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      trip: true,
      user: true,
      tripUpdates: { orderBy: { timestamp: "desc" } },
    },
  });
  if (!booking || booking.trip.vendorId !== vendorId) {
    throw new Error("Booking not found.");
  }
  return booking;
}

export async function postTripUpdate(
  bookingId: string,
  vendorId: string,
  input: VendorTripUpdateValues
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true },
  });
  if (!booking || booking.trip.vendorId !== vendorId) {
    throw new Error("Booking not found.");
  }
  if (booking.status !== "ongoing") {
    throw new Error("Booking is not ongoing.");
  }

  return prisma.tripUpdate.create({
    data: {
      bookingId,
      timestamp: new Date(),
      locationLabel: input.locationLabel,
      note: input.note,
      healthBp: input.healthBp,
      healthSugar: input.healthSugar,
      healthTemp: input.healthTemp,
      healthStatus: input.healthStatus,
    },
  });
}
