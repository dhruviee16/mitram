import { revalidateTag, unstable_cache } from "next/cache";
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

  const review = await prisma.review.create({
    data: {
      bookingId: input.bookingId,
      tripId: booking.tripId,
      userId,
      rating: input.rating,
      comment: input.comment || null,
    },
  });
  revalidateTag("reviews", { expire: 0 });
  return review;
}

export const listReviewsForTrip = unstable_cache(
  (tripId: string) =>
    prisma.review.findMany({
      where: { tripId, status: "published" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
  ["reviews-for-trip"],
  { tags: ["reviews"], revalidate: 300 },
);

export const getTripRatingSummary = unstable_cache(
  async (tripId: string) => {
    const result = await prisma.review.aggregate({
      where: { tripId, status: "published" },
      _avg: { rating: true },
      _count: true,
    });
    return { average: result._avg.rating ?? 0, count: result._count };
  },
  ["trip-rating-summary"],
  { tags: ["reviews"], revalidate: 300 },
);

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

export async function updateReview(
  id: string,
  data: { rating: number; comment: string | null; images: string[] },
) {
  const review = await prisma.review.update({ where: { id }, data });
  revalidateTag("reviews", { expire: 0 });
  return review;
}

export async function deleteReview(id: string) {
  await prisma.review.delete({ where: { id } });
  revalidateTag("reviews", { expire: 0 });
}
