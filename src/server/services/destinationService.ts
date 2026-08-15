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

export function getDestinationBySlug(slug: string) {
  return prisma.destination.findUnique({ where: { slug } });
}
