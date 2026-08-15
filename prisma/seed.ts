import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { categories } from "./seed-data/categories";
import { destinations } from "./seed-data/destinations";
import { trips } from "./seed-data/trips";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categoryBySlug = new Map<string, string>();
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryBySlug.set(category.slug, row.id);
  }

  const destinationBySlug = new Map<string, string>();
  for (const destination of destinations) {
    const row = await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: destination,
      create: destination,
    });
    destinationBySlug.set(destination.slug, row.id);
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  // Primary MITRAM operations account — admin access, and the vendor-of-record
  // (owns every seeded trip) so admin + trip ownership live on one real login.
  // Password comes from env, never hardcoded — this is a real personal login.
  const ownerEmail = process.env.SEED_ADMIN_EMAIL;
  const ownerPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!ownerEmail || !ownerPassword) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env before seeding (owner/admin account credentials)."
    );
  }
  const ownerPasswordHash = await bcrypt.hash(ownerPassword, 10);
  const vendorUser = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { passwordHash: ownerPasswordHash, role: "admin" },
    create: {
      email: ownerEmail,
      passwordHash: ownerPasswordHash,
      name: "Dhruvi Ahir",
      phone: "+919820000000",
      role: "admin",
    },
  });

  await prisma.vendorProfile.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: "Mitram Journeys Pvt Ltd",
      ownerName: "Dhruvi Ahir",
      gst: "27AAAAA0000A1Z5",
      pan: "AAAAA0000A",
      businessAddress: "Andheri East, Mumbai, Maharashtra",
      yearsInBusiness: 12,
      destinationsServed: ["Jharkhand", "Gujarat", "Uttarakhand", "Jammu & Kashmir", "Maharashtra"],
      website: "https://mitramjourneys.example",
      verificationStatus: "verified",
      identityVerified: true,
      businessVerified: true,
      experienceVerified: true,
      safetyVerified: true,
    },
  });

  for (const trip of trips) {
    const { days, dates, categorySlug, destinationSlug, ...tripData } = trip;
    const categoryId = categoryBySlug.get(categorySlug);
    const destinationId = destinationSlug ? destinationBySlug.get(destinationSlug) : undefined;
    if (!categoryId) throw new Error(`Unknown category slug: ${categorySlug}`);

    await prisma.trip.upsert({
      where: { slug: trip.slug },
      update: { ...tripData, categoryId, destinationId, vendorId: vendorUser.id },
      create: {
        ...tripData,
        categoryId,
        destinationId,
        vendorId: vendorUser.id,
        days: { create: days },
        dates: { create: dates },
      },
    });
  }

  const demoUser = await prisma.user.upsert({
    where: { email: "arjun.jain@example.com" },
    update: {},
    create: {
      email: "arjun.jain@example.com",
      passwordHash,
      name: "Arjun Jain",
      phone: "+971501234567",
      role: "traveler",
    },
  });

  const parentProfile = await prisma.travelerProfile.upsert({
    where: { id: "demo-traveler-ramesh" },
    update: {},
    create: {
      id: "demo-traveler-ramesh",
      userId: demoUser.id,
      name: "Ramesh Jain",
      age: 72,
      relationship: "parent",
      healthNotes: ["Hypertensive", "Type 2 Diabetes"],
      dietaryNeeds: ["Jain Satvik"],
    },
  });

  const familyConnection = await prisma.familyConnection.upsert({
    where: { id: "demo-family-arjun" },
    update: {},
    create: {
      id: "demo-family-arjun",
      userId: demoUser.id,
      name: "Arjun Jain",
      email: "arjun.jain@example.com",
      phone: "+971501234567",
      relationship: "Son",
      tripUpdates: true,
      arrivalUpdates: true,
      photos: true,
      liveLocation: true,
      emergencyNotifications: true,
    },
  });

  const shikharji = await prisma.trip.findUniqueOrThrow({ where: { slug: "sammed-shikharji-yatra" } });
  const shikharjiDate = await prisma.tripDate.findFirstOrThrow({ where: { tripId: shikharji.id } });

  const demoBooking = await prisma.booking.upsert({
    where: { id: "demo-booking-1" },
    update: {},
    create: {
      id: "demo-booking-1",
      userId: demoUser.id,
      tripId: shikharji.id,
      tripDateId: shikharjiDate.id,
      bookedFor: "parent",
      travelers: { connect: [{ id: parentProfile.id }] },
      numTravelers: 1,
      travelDate: shikharjiDate.departureDate,
      roomType: "single",
      emergencyContactName: "Arjun Jain",
      emergencyContactPhone: "+971501234567",
      emergencyContactRelation: "Son",
      familyConnectionId: familyConnection.id,
      insuranceOpted: true,
      specialCareRequests: ["Jain satvik meals", "BP monitoring twice daily"],
      totalAmount: shikharji.basePrice,
      status: "ongoing",
      trackingVisible: true,
    },
  });

  await prisma.payment.upsert({
    where: { bookingId: demoBooking.id },
    update: {},
    create: {
      bookingId: demoBooking.id,
      razorpayOrderId: "order_demo_seed",
      razorpayPaymentId: "pay_demo_seed",
      status: "paid",
      amount: shikharji.basePrice,
    },
  });

  await prisma.savedTrip.upsert({
    where: { userId_tripId: { userId: demoUser.id, tripId: shikharji.id } },
    update: {},
    create: { userId: demoUser.id, tripId: shikharji.id },
  });

  await prisma.tripUpdate.deleteMany({ where: { bookingId: demoBooking.id } });

  const baseTime = new Date("2026-02-17T06:00:00+05:30");
  const updates = [
    { hoursOffset: 0, locationLabel: "Delhi", note: "Group departed Delhi for Deoghar, all well.", healthStatus: "ok" as const, healthBp: "126/82", healthSugar: "108", healthTemp: "98.2" },
    { hoursOffset: 3, locationLabel: "Deoghar", note: "Papa is at Tonk 4, Ajitnath Temple · All well · BP normal", healthStatus: "ok" as const, healthBp: "128/84", healthSugar: "112", healthTemp: "98.4" },
  ];

  for (const u of updates) {
    await prisma.tripUpdate.create({
      data: {
        bookingId: demoBooking.id,
        timestamp: new Date(baseTime.getTime() + u.hoursOffset * 3600 * 1000),
        locationLabel: u.locationLabel,
        note: u.note,
        healthStatus: u.healthStatus,
        healthBp: u.healthBp,
        healthSugar: u.healthSugar,
        healthTemp: u.healthTemp,
      },
    });
  }

  const maharashtraTrip = await prisma.trip.findUniqueOrThrow({
    where: { slug: "maharashtra-jyotirlinga-circuit" },
  });
  const maharashtraDate = await prisma.tripDate.findFirstOrThrow({ where: { tripId: maharashtraTrip.id } });

  const completedTraveler = await prisma.travelerProfile.upsert({
    where: { id: "demo-traveler-arjun-self" },
    update: {},
    create: {
      id: "demo-traveler-arjun-self",
      userId: demoUser.id,
      name: "Arjun Jain",
      age: 45,
      relationship: "self",
      healthNotes: [],
      dietaryNeeds: ["Jain Satvik"],
    },
  });

  const completedBooking = await prisma.booking.upsert({
    where: { id: "demo-booking-completed-1" },
    update: {},
    create: {
      id: "demo-booking-completed-1",
      userId: demoUser.id,
      tripId: maharashtraTrip.id,
      tripDateId: maharashtraDate.id,
      bookedFor: "self",
      travelers: { connect: [{ id: completedTraveler.id }] },
      numTravelers: 1,
      travelDate: maharashtraDate.departureDate,
      roomType: "twin",
      emergencyContactName: "Priya Jain",
      emergencyContactPhone: "+919820011223",
      emergencyContactRelation: "Spouse",
      insuranceOpted: true,
      totalAmount: maharashtraTrip.basePrice,
      status: "completed",
      trackingVisible: true,
    },
  });

  await prisma.payment.upsert({
    where: { bookingId: completedBooking.id },
    update: {},
    create: {
      bookingId: completedBooking.id,
      razorpayOrderId: "order_demo_seed_2",
      razorpayPaymentId: "pay_demo_seed_2",
      status: "paid",
      amount: maharashtraTrip.basePrice,
    },
  });

  await prisma.review.upsert({
    where: { bookingId: completedBooking.id },
    update: {},
    create: {
      bookingId: completedBooking.id,
      tripId: maharashtraTrip.id,
      userId: demoUser.id,
      rating: 5,
      comment: "Slow-paced and genuinely comfortable — the coordinator made all the difference for my father.",
      status: "published",
    },
  });

  const testimonials = [
    { name: "Arjun J.", age: null, city: "Dubai", tripTitle: "Sammed Shikharji Yatra", quote: "I could see exactly where Papa was on the Shikharji trek, every step. That mattered more than anything else.", rating: 5, isSample: true, featured: true },
    { name: "Priya S.", age: null, city: "Bangalore", tripTitle: "Vaishno Devi Yatra", quote: "The companion knew Ma's medication schedule better than I did some days. That's what peace of mind looks like.", rating: 5, isSample: true, featured: true },
    { name: "Ramesh J.", age: 72, city: "Mumbai", tripTitle: "Sammed Shikharji Yatra", quote: "First trip in years where I didn't feel like a burden on anyone.", rating: 5, isSample: true, featured: true },
  ];
  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name, tripTitle: t.tripTitle } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }

  await prisma.coupon.upsert({
    where: { code: "MITRAM500" },
    update: {},
    create: {
      code: "MITRAM500",
      discountType: "flat",
      value: 500,
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2026-12-31"),
      usageLimit: 500,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
