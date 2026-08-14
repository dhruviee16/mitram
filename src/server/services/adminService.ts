import { prisma } from "@/server/db";
import type { VendorVerificationStatus, TripStatus } from "@/generated/prisma/client";

export function listVendors() {
  return prisma.vendorProfile.findMany({
    include: { user: true, _count: { select: { documents: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function setVendorVerification(vendorProfileId: string, status: VendorVerificationStatus) {
  return prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: {
      verificationStatus: status,
      ...(status === "verified"
        ? { identityVerified: true, businessVerified: true, experienceVerified: true, safetyVerified: true }
        : {}),
    },
  });
}

export function listTripsForApproval() {
  return prisma.trip.findMany({
    where: { status: { in: ["pending_approval", "approved", "paused", "rejected"] } },
    include: { category: true, vendor: { include: { vendorProfile: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function setTripStatus(tripId: string, status: TripStatus) {
  return prisma.trip.update({ where: { id: tripId }, data: { status } });
}

export function listAllBookings() {
  return prisma.booking.findMany({
    include: { user: true, trip: true, payment: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export function listTestimonials() {
  return prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
}

export async function setTestimonialFeatured(id: string, featured: boolean) {
  return prisma.testimonial.update({ where: { id }, data: { featured } });
}

export async function deleteTestimonial(id: string) {
  await prisma.testimonial.delete({ where: { id } });
}

export async function getAdminOverview() {
  const [pendingVendors, pendingTrips, totalBookings, totalUsers] = await Promise.all([
    prisma.vendorProfile.count({ where: { verificationStatus: { in: ["pending", "under_review"] } } }),
    prisma.trip.count({ where: { status: "pending_approval" } }),
    prisma.booking.count(),
    prisma.user.count({ where: { role: "traveler" } }),
  ]);
  return { pendingVendors, pendingTrips, totalBookings, totalUsers };
}
