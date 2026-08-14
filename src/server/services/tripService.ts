import { Prisma, type WalkingIntensity } from "@/generated/prisma/client";
import { prisma } from "@/server/db";

export function listTrips() {
  return prisma.trip.findMany({
    where: { status: "approved" },
    include: { category: true, destination: true, vendor: { include: { vendorProfile: true } } },
    orderBy: { title: "asc" },
  });
}

export function getTripBySlug(slug: string) {
  return prisma.trip.findUnique({
    where: { slug },
    include: {
      days: { orderBy: { dayNumber: "asc" } },
      dates: { orderBy: { departureDate: "asc" } },
      category: true,
      destination: true,
      vendor: { include: { vendorProfile: true } },
    },
  });
}

export function getTripForBooking(slug: string) {
  return prisma.trip.findUnique({
    where: { slug },
    include: {
      dates: { where: { departureDate: { gte: new Date() } }, orderBy: { departureDate: "asc" } },
    },
  });
}

export type TripSort =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "popular"
  | "rating"
  | "newest"
  | "departure-soon";

export type TripSearchParams = {
  q?: string;
  category?: string;
  destination?: string;
  month?: string; // "2026-10"
  durationMax?: number;
  priceMin?: number;
  priceMax?: number;
  walkingIntensity?: string[];
  hotelCategoryMin?: number;
  mealsPlan?: string[];
  insuranceIncluded?: boolean;
  coordinatorIncluded?: boolean;
  sort?: TripSort;
};

export async function searchTrips(params: TripSearchParams) {
  const where: Prisma.TripWhereInput = { status: "approved" };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { routeSummary: { contains: params.q, mode: "insensitive" } },
      { destination: { name: { contains: params.q, mode: "insensitive" } } },
    ];
  }
  if (params.category) where.category = { slug: params.category };
  if (params.destination) where.destination = { slug: params.destination };
  if (params.durationMax) where.durationDays = { lte: params.durationMax };
  if (params.priceMin || params.priceMax) {
    where.basePrice = {
      ...(params.priceMin ? { gte: params.priceMin } : {}),
      ...(params.priceMax ? { lte: params.priceMax } : {}),
    };
  }
  if (params.walkingIntensity?.length) {
    where.walkingIntensity = { in: params.walkingIntensity as WalkingIntensity[] };
  }
  if (params.hotelCategoryMin) where.hotelCategory = { gte: params.hotelCategoryMin };
  if (params.mealsPlan?.length) where.mealsPlan = { hasSome: params.mealsPlan };
  if (params.insuranceIncluded) where.insuranceIncluded = true;
  if (params.coordinatorIncluded) where.coordinatorIncluded = true;
  if (params.month) {
    const [year, month] = params.month.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    where.dates = { some: { departureDate: { gte: start, lt: end } } };
  }

  const orderBy: Prisma.TripOrderByWithRelationInput =
    params.sort === "price-asc"
      ? { basePrice: "asc" }
      : params.sort === "price-desc"
        ? { basePrice: "desc" }
        : params.sort === "popular"
          ? { bookings: { _count: "desc" } }
          : params.sort === "newest"
              ? { createdAt: "desc" }
              : { title: "asc" };

  const trips = await prisma.trip.findMany({
    where,
    include: {
      category: true,
      destination: true,
      vendor: { include: { vendorProfile: true } },
      dates: { orderBy: { departureDate: "asc" }, take: 1, where: { departureDate: { gte: new Date() } } },
      reviews: params.sort === "rating" ? { select: { rating: true } } : false,
    },
    orderBy,
  });

  if (params.sort === "departure-soon") {
    return trips
      .slice()
      .sort((a, b) => {
        const aDate = a.dates[0]?.departureDate?.getTime() ?? Infinity;
        const bDate = b.dates[0]?.departureDate?.getTime() ?? Infinity;
        return aDate - bDate;
      });
  }

  if (params.sort === "rating") {
    const avg = (t: (typeof trips)[number]) => {
      const reviews = "reviews" in t ? (t.reviews as { rating: number }[]) : [];
      return reviews.length === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    };
    return trips.slice().sort((a, b) => avg(b) - avg(a));
  }

  return trips;
}

export function getRelatedTrips(tripId: string, categoryId: string) {
  return prisma.trip.findMany({
    where: { status: "approved", categoryId, id: { not: tripId } },
    include: { category: true, destination: true, vendor: { include: { vendorProfile: true } } },
    take: 4,
  });
}
