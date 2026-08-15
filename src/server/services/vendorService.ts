import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { prisma } from "@/server/db";
import { DuplicateEmailError } from "@/server/services/authService";
import type { VendorTripValues, VendorTripUpdateValues, VendorRegisterValues } from "@/lib/validations/vendor";

export async function registerVendor(input: VendorRegisterValues) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new DuplicateEmailError();
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.ownerName,
      phone: input.phone || null,
      role: "vendor",
      vendorProfile: {
        create: {
          businessName: input.businessName,
          ownerName: input.ownerName,
          gst: input.gst || null,
          pan: input.pan || null,
          businessAddress: input.businessAddress || null,
          yearsInBusiness: input.yearsInBusiness ?? null,
          destinationsServed: input.destinationsServed,
          website: input.website || null,
          verificationStatus: "pending",
        },
      },
    },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function getVendorProfile(userId: string) {
  return prisma.vendorProfile.findUnique({ where: { userId } });
}

export function listTripsForVendor(vendorId: string) {
  return prisma.trip.findMany({
    where: { vendorId },
    include: { _count: { select: { bookings: true } }, category: true },
    orderBy: { createdAt: "desc" },
  });
}

function slugify(title: string) {
  return `${title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${nanoid(6)}`;
}

export async function createTrip(vendorId: string, input: VendorTripValues, options?: { autoApprove?: boolean }) {
  const category = await prisma.category.findUniqueOrThrow({ where: { slug: input.category } });
  const trip = await prisma.trip.create({
    data: {
      slug: slugify(input.title),
      title: input.title,
      categoryId: category.id,
      destinationId: input.destinationId || null,
      status: options?.autoApprove ? "approved" : "pending_approval",
      routeSummary: input.routeSummary,
      durationDays: input.durationDays,
      durationNights: input.durationNights,
      basePrice: input.basePrice,
      images: input.images,
      careFeatures: input.careFeatures,
      inclusions: input.inclusions,
      exclusions: input.exclusions,
      summary: input.summary,
      walkingIntensity: input.walkingIntensity,
      groupSizeMin: input.groupSizeMin,
      groupSizeMax: input.groupSizeMax,
      ageGroupMin: input.ageGroupMin,
      ageGroupMax: input.ageGroupMax,
      hotelCategory: input.hotelCategory,
      mealsPlan: input.mealsPlan,
      insuranceIncluded: input.insuranceIncluded,
      coordinatorIncluded: input.coordinatorIncluded,
      accessibilityNotes: input.accessibilityNotes || null,
      vendorId,
      days: {
        create: input.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          activities: day.activities,
        })),
      },
      dates: {
        create: input.dates.map((d) => ({
          departureDate: new Date(d.departureDate),
          returnDate: new Date(
            new Date(d.departureDate).getTime() + (input.durationDays - 1) * 24 * 60 * 60 * 1000
          ),
          seatsTotal: d.seatsTotal,
          seatsAvailable: d.seatsTotal,
        })),
      },
    },
  });

  return { tripId: trip.id, slug: trip.slug };
}

export async function getTripForVendor(tripId: string, vendorId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      days: { orderBy: { dayNumber: "asc" } },
      dates: { orderBy: { departureDate: "asc" } },
      category: true,
    },
  });
  if (!trip || trip.vendorId !== vendorId) {
    throw new Error("Trip not found.");
  }
  return trip;
}

export async function updateTrip(tripId: string, vendorId: string, input: VendorTripValues) {
  const existing = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!existing || existing.vendorId !== vendorId) {
    throw new Error("Trip not found.");
  }

  const category = await prisma.category.findUniqueOrThrow({ where: { slug: input.category } });
  await prisma.tripDay.deleteMany({ where: { tripId } });
  await prisma.tripDate.deleteMany({ where: { tripId, bookings: { none: {} } } });

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      title: input.title,
      categoryId: category.id,
      destinationId: input.destinationId || null,
      routeSummary: input.routeSummary,
      durationDays: input.durationDays,
      durationNights: input.durationNights,
      basePrice: input.basePrice,
      images: input.images,
      careFeatures: input.careFeatures,
      inclusions: input.inclusions,
      exclusions: input.exclusions,
      summary: input.summary,
      walkingIntensity: input.walkingIntensity,
      groupSizeMin: input.groupSizeMin,
      groupSizeMax: input.groupSizeMax,
      ageGroupMin: input.ageGroupMin,
      ageGroupMax: input.ageGroupMax,
      hotelCategory: input.hotelCategory,
      mealsPlan: input.mealsPlan,
      insuranceIncluded: input.insuranceIncluded,
      coordinatorIncluded: input.coordinatorIncluded,
      accessibilityNotes: input.accessibilityNotes || null,
      days: {
        create: input.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          activities: day.activities,
        })),
      },
      dates: {
        create: input.dates.map((d) => ({
          departureDate: new Date(d.departureDate),
          returnDate: new Date(
            new Date(d.departureDate).getTime() + (input.durationDays - 1) * 24 * 60 * 60 * 1000
          ),
          seatsTotal: d.seatsTotal,
          seatsAvailable: d.seatsTotal,
        })),
      },
    },
  });

  return { tripId: trip.id, slug: trip.slug };
}

export async function listBookingsForVendorTrip(tripId: string, vendorId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.vendorId !== vendorId) {
    throw new Error("Trip not found.");
  }

  return prisma.booking.findMany({
    where: { tripId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVendorEarnings(vendorId: string) {
  const result = await prisma.payment.aggregate({
    where: { status: "paid", booking: { trip: { vendorId } } },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getVendorAnalytics(vendorId: string) {
  const [tripCount, bookingCount, confirmedBookingCount, revenue, upcomingDates] = await Promise.all([
    prisma.trip.count({ where: { vendorId } }),
    prisma.booking.count({ where: { trip: { vendorId } } }),
    prisma.booking.count({ where: { trip: { vendorId }, status: { in: ["confirmed", "ongoing", "completed"] } } }),
    getVendorEarnings(vendorId),
    prisma.tripDate.count({ where: { trip: { vendorId }, departureDate: { gte: new Date() } } }),
  ]);

  const conversionRate = bookingCount === 0 ? 0 : Math.round((confirmedBookingCount / bookingCount) * 100);

  return { tripCount, bookingCount, confirmedBookingCount, revenue, upcomingDates, conversionRate };
}

export async function getBookingForVendorUpdate(bookingId: string, vendorId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      trip: true,
      user: true,
      tripUpdates: { orderBy: { timestamp: "desc" } },
    },
  });
  if (!booking || booking.trip.vendorId !== vendorId) {
    throw new Error("Booking not found.");
  }
  return booking;
}

export async function startTrip(bookingId: string, vendorId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true },
  });
  if (!booking || booking.trip.vendorId !== vendorId) {
    throw new Error("Booking not found.");
  }
  if (booking.status !== "confirmed") {
    throw new Error("Booking is not confirmed.");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "ongoing" },
  });
}

export async function postTripUpdate(
  bookingId: string,
  vendorId: string,
  input: VendorTripUpdateValues
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true },
  });
  if (!booking || booking.trip.vendorId !== vendorId) {
    throw new Error("Booking not found.");
  }
  if (booking.status !== "ongoing") {
    throw new Error("Booking is not ongoing.");
  }

  return prisma.tripUpdate.create({
    data: {
      bookingId,
      timestamp: new Date(),
      locationLabel: input.locationLabel,
      note: input.note,
      healthBp: input.healthBp,
      healthSugar: input.healthSugar,
      healthTemp: input.healthTemp,
      healthStatus: input.healthStatus,
    },
  });
}
