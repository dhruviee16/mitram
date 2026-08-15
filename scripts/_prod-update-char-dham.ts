import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.PROD_DATABASE_URL! }),
  });
  const trip = await prisma.trip.update({
    where: { slug: "char-dham-yatra" },
    data: {
      images: [
        "https://pub-e2dcf0df0eed403bb4516ca57564bed7.r2.dev/seed/trips/char-dham-yatra-1.jpg",
        "https://pub-e2dcf0df0eed403bb4516ca57564bed7.r2.dev/seed/trips/char-dham-yatra-2.webp",
      ],
    },
  });
  console.log(trip.images);
  await prisma.$disconnect();
}
main();
