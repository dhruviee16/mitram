import { prisma } from "@/server/db";

export function listDestinations() {
  return prisma.destination.findMany({
    include: { _count: { select: { trips: { where: { status: "approved" } } } } },
    orderBy: { name: "asc" },
  });
}

export function getDestinationBySlug(slug: string) {
  return prisma.destination.findUnique({ where: { slug } });
}
