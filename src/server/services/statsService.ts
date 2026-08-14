import { prisma } from "@/server/db";

export async function getHomeStats() {
  const [approvedTrips, destinations, verifiedSaathis, travelersResult, ratingResult] =
    await Promise.all([
      prisma.trip.count({ where: { status: "approved" } }),
      prisma.destination.count(),
      prisma.vendorProfile.count({ where: { verificationStatus: "verified" } }),
      prisma.booking.aggregate({
        _sum: { numTravelers: true },
        where: { status: { in: ["confirmed", "upcoming", "ongoing", "completed"] } },
      }),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);

  return {
    approvedTrips,
    destinations,
    verifiedSaathis,
    travelers: travelersResult._sum.numTravelers ?? 0,
    averageRating: ratingResult._avg.rating ?? 0,
  };
}
