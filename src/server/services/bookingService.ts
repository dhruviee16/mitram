import { prisma } from "@/server/db";
import { getTripBySlug } from "@/server/services/tripService";
import type { BookingRequestValues } from "@/lib/validations/booking";

export function listBookingsForUser(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { trip: true, travelers: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBooking(userId: string, input: BookingRequestValues) {
  const trip = await getTripBySlug(input.tripSlug);
  if (!trip) {
    throw new Error("Trip not found.");
  }

  const traveler = await prisma.travelerProfile.create({
    data: {
      userId,
      name: input.traveler.name,
      age: input.traveler.age,
      relationship: input.traveler.relationship,
      healthNotes: input.traveler.healthNotes,
      dietaryNeeds: input.traveler.dietaryNeeds,
    },
  });

  const booking = await prisma.booking.create({
    data: {
      userId,
      tripId: trip.id,
      bookedFor: input.bookedFor,
      travelers: { connect: [{ id: traveler.id }] },
      numTravelers: 1,
      travelDate: input.travelDate,
      roomType: input.roomType,
      specialCareRequests: input.specialCareRequests,
      totalAmount: trip.basePrice,
      status: "pending",
    },
  });

  return { bookingId: booking.id, totalAmount: booking.totalAmount };
}

export async function setTrackingVisibility(bookingId: string, userId: string, visible: boolean) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) {
    throw new Error("Booking not found.");
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { trackingVisible: visible },
  });

  return { trackingVisible: updated.trackingVisible };
}

export function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      trip: { include: { days: { orderBy: { dayNumber: "asc" } } } },
      travelers: true,
      payment: true,
      tripUpdates: { orderBy: { timestamp: "asc" } },
    },
  });
}
