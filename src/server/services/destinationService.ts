import { nanoid } from "nanoid";
import { prisma } from "@/server/db";

function slugify(name: string) {
  return `${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${nanoid(6)}`;
}

export function createDestination(name: string) {
  return prisma.destination.create({
    data: { name, slug: slugify(name) },
  });
}

export function listDestinations() {
  return prisma.destination.findMany({
    include: { _count: { select: { trips: { where: { status: "approved" } } } } },
    orderBy: { name: "asc" },
  });
}

// Vendors can add a destination with just a name; until an admin fills in the
// photo it stays invisible to travelers rather than showing a broken-looking
// green placeholder card on public pages.
export function listPublishedDestinations(limit?: number) {
  return prisma.destination.findMany({
    where: { heroImage: { not: null } },
    orderBy: { name: "asc" },
    ...(limit ? { take: limit } : {}),
  });
}

export function getDestinationBySlug(slug: string) {
  return prisma.destination.findUnique({ where: { slug } });
}

export function getDestinationById(id: string) {
  return prisma.destination.findUnique({ where: { id } });
}

export function updateDestination(
  id: string,
  data: { name?: string; state?: string | null; bestTime?: string | null; description?: string | null; heroImage?: string | null },
) {
  return prisma.destination.update({ where: { id }, data });
}
