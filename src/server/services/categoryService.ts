import { prisma } from "@/server/db";

export function listCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { trips: { where: { status: "approved" } } } } },
    orderBy: { name: "asc" },
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}
