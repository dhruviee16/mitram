import { prisma } from "@/server/db";

export function listTrips() {
  return prisma.trip.findMany({
    orderBy: { title: "asc" },
  });
}

export function getTripBySlug(slug: string) {
  return prisma.trip.findUnique({
    where: { slug },
    include: { days: { orderBy: { dayNumber: "asc" } } },
  });
}
