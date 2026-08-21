import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";

export const listFeaturedTestimonials = unstable_cache(
  () =>
    prisma.testimonial.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ["testimonials-featured"],
  { tags: ["testimonials"], revalidate: 300 },
);
