import { prisma } from "@/server/db";

export function listFeaturedTestimonials() {
  return prisma.testimonial.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}
