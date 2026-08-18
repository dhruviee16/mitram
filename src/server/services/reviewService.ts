import { prisma } from "@/server/db";
import type { ReviewValues } from "@/lib/validations/review";

export async function createReview(userId: string, input: ReviewValues) {
  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
  if (!booking || booking.userId !== userId) {
    throw new Error("Booking not found.");
  }
  if (booking.status !== "completed") {
    throw new Error("You can review a trip once it's completed.");
  }

  const existing = await prisma.review.findUnique({ where: { bookingId: input.bookingId } });
  if (existing) {
    throw new Error("You've already reviewed this trip.");
  }

  return prisma.review.create({
    data: {
      bookingId: input.bookingId,
      tripId: booking.tripId,
      userId,
      rating: input.rating,
      comment: input.comment || null,
    },
  });
}

export function listReviewsForTrip(tripId: string) {
  return prisma.review.findMany({
    where: { tripId, status: "published" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTripRatingSummary(tripId: string) {
  const result = await prisma.review.aggregate({
    where: { tripId, status: "published" },
    _avg: { rating: true },
    _count: true,
  });
  return { average: result._avg.rating ?? 0, count: result._count };
}

export function getReviewForBooking(bookingId: string) {
  return prisma.review.findUnique({ where: { bookingId } });
}

export function listAllReviews() {
  return prisma.review.findMany({
    include: { user: true, trip: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getReviewById(id: string) {
  return prisma.review.findUnique({ where: { id }, include: { trip: true } });
}

export function updateReview(
  id: string,
  data: { rating: number; comment: string | null; images: string[] },
) {
  return prisma.review.update({ where: { id }, data });
}
