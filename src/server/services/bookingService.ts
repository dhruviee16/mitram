import { prisma } from "@/server/db";
import { getTripBySlug } from "@/server/services/tripService";
import type { BookingRequestValues } from "@/lib/validations/booking";

export function listBookingsForUser(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { trip: true, travelers: true, payment: true, tripDate: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBooking(userId: string, input: BookingRequestValues) {
  const trip = await getTripBySlug(input.tripSlug);
  if (!trip) {
    throw new Error("Trip not found.");
  }

  const tripDate = trip.dates.find((d) => d.id === input.tripDateId);
  if (!tripDate) {
    throw new Error("Departure date not found.");
  }

  let familyConnectionId: string | undefined;
  if (input.familyContact.link && input.familyContact.name) {
    const familyConnection = await prisma.familyConnection.create({
      data: {
        userId,
        name: input.familyContact.name,
        email: input.familyContact.email || null,
        phone: input.familyContact.phone || null,
        relationship: input.familyContact.relationship || "Family",
      },
    });
    familyConnectionId = familyConnection.id;
  }

  const travelers = await Promise.all(
    input.travelers.map((traveler) =>
      prisma.travelerProfile.create({
        data: {
          userId,
          name: traveler.name,
          age: traveler.age,
          relationship: traveler.relationship,
          healthNotes: traveler.healthNotes,
          dietaryNeeds: traveler.dietaryNeeds,
        },
      })
    )
  );

  const totalAmount = trip.basePrice * travelers.length;

  const booking = await prisma.booking.create({
    data: {
      userId,
      tripId: trip.id,
      tripDateId: tripDate.id,
      bookedFor: input.bookedFor,
      travelers: { connect: travelers.map((t) => ({ id: t.id })) },
      numTravelers: travelers.length,
      travelDate: tripDate.departureDate,
      roomType: input.roomType,
      specialCareRequests: input.specialCareRequests,
      emergencyContactName: input.emergencyContact.name,
      emergencyContactPhone: input.emergencyContact.phone,
      emergencyContactRelation: input.emergencyContact.relation,
      familyConnectionId,
      insuranceOpted: input.insuranceOpted,
      totalAmount,
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

export function getOngoingBookingForUser(userId: string) {
  return prisma.booking.findFirst({
    where: { userId, status: "ongoing" },
    include: { trip: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      trip: { include: { days: { orderBy: { dayNumber: "asc" } } } },
      travelers: true,
      payment: true,
      tripDate: true,
      familyConnection: true,
      review: true,
      tripUpdates: { orderBy: { timestamp: "asc" } },
    },
  });
}
