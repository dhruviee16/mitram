import { prisma } from "@/server/db";

export function listBookingsForUser(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { trip: true, travelers: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      trip: { include: { days: { orderBy: { dayNumber: "asc" } } } },
      travelers: true,
      payment: true,
      tripUpdates: { orderBy: { timestamp: "asc" } },
    },
  });
}
