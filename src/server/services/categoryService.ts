import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";

export const listCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      include: { _count: { select: { trips: { where: { status: "approved" } } } } },
      orderBy: { name: "asc" },
    }),
  ["categories-list"],
  { tags: ["categories"], revalidate: 300 },
);

export const getCategoryBySlug = unstable_cache(
  (slug: string) => prisma.category.findUnique({ where: { slug } }),
  ["category-by-slug"],
  { tags: ["categories"], revalidate: 300 },
);
