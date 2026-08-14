import { prisma } from "@/server/db";

export function listSavedTrips(userId: string) {
  return prisma.savedTrip.findMany({
    where: { userId },
    include: { trip: { include: { category: true, destination: true, vendor: { include: { vendorProfile: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function saveTrip(userId: string, tripId: string) {
  return prisma.savedTrip.upsert({
    where: { userId_tripId: { userId, tripId } },
    update: {},
    create: { userId, tripId },
  });
}

export async function unsaveTrip(userId: string, tripId: string) {
  await prisma.savedTrip.deleteMany({ where: { userId, tripId } });
}

export function isTripSaved(userId: string, tripId: string) {
  return prisma.savedTrip
    .findUnique({ where: { userId_tripId: { userId, tripId } } })
    .then((row) => Boolean(row));
}
