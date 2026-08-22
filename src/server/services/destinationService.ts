import { nanoid } from "nanoid";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/server/db";

function slugify(name: string) {
  return `${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${nanoid(6)}`;
}

export async function createDestination(name: string) {
  const destination = await prisma.destination.create({
    data: { name, slug: slugify(name) },
  });
  revalidateTag("destinations", { expire: 0 });
  return destination;
}

export const listDestinations = unstable_cache(
  () =>
    prisma.destination.findMany({
      include: { _count: { select: { trips: { where: { status: "approved" } } } } },
      orderBy: { name: "asc" },
    }),
  ["destinations-list"],
  { tags: ["destinations"], revalidate: 300 },
);

export const listPublishedDestinations = unstable_cache(
  (limit?: number) =>
    prisma.destination.findMany({
      orderBy: { name: "asc" },
      ...(limit ? { take: limit } : {}),
    }),
  ["destinations-published"],
  { tags: ["destinations"], revalidate: 300 },
);

export const getDestinationBySlug = unstable_cache(
  (slug: string) => prisma.destination.findUnique({ where: { slug } }),
  ["destination-by-slug"],
  { tags: ["destinations"], revalidate: 300 },
);

export function getDestinationById(id: string) {
  return prisma.destination.findUnique({ where: { id } });
}

export async function updateDestination(
  id: string,
  data: { name?: string; state?: string | null; bestTime?: string | null; description?: string | null; heroImage?: string | null },
) {
  const destination = await prisma.destination.update({ where: { id }, data });
  revalidateTag("destinations", { expire: 0 });
  return destination;
}
