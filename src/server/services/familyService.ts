import { prisma } from "@/server/db";
import type { FamilyConnectionValues } from "@/lib/validations/family";

export function listFamilyConnections(userId: string) {
  return prisma.familyConnection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function createFamilyConnection(userId: string, input: FamilyConnectionValues) {
  return prisma.familyConnection.create({
    data: {
      userId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      relationship: input.relationship,
      tripUpdates: input.tripUpdates,
      arrivalUpdates: input.arrivalUpdates,
      photos: input.photos,
      liveLocation: input.liveLocation,
      emergencyNotifications: input.emergencyNotifications,
    },
  });
}

export async function updateFamilyConnectionPermissions(
  id: string,
  userId: string,
  permissions: Partial<
    Pick<FamilyConnectionValues, "tripUpdates" | "arrivalUpdates" | "photos" | "liveLocation" | "emergencyNotifications">
  >
) {
  const existing = await prisma.familyConnection.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Family connection not found.");
  }
  return prisma.familyConnection.update({ where: { id }, data: permissions });
}

export async function deleteFamilyConnection(id: string, userId: string) {
  const existing = await prisma.familyConnection.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Family connection not found.");
  }
  await prisma.familyConnection.delete({ where: { id } });
}
