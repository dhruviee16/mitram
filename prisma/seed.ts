import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { trips, internationalTrips } from "./seed-data/trips";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const trip of [...trips, ...internationalTrips]) {
    const { days, ...tripData } = trip;
    await prisma.trip.upsert({
      where: { slug: trip.slug },
      update: tripData,
      create: {
        ...tripData,
        days: { create: days },
      },
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "arjun.jain@example.com" },
    update: {},
    create: {
      email: "arjun.jain@example.com",
      passwordHash,
      name: "Arjun Jain",
      phone: "+971501234567",
      role: "nri",
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

  const shikharji = await prisma.trip.findUniqueOrThrow({ where: { slug: "sammed-shikharji-yatra" } });

  const demoBooking = await prisma.booking.upsert({
    where: { id: "demo-booking-1" },
    update: {},
    create: {
      id: "demo-booking-1",
      userId: demoUser.id,
      tripId: shikharji.id,
      bookedFor: "parent",
      travelers: { connect: [{ id: parentProfile.id }] },
      numTravelers: 1,
      travelDate: new Date("2026-09-15"),
      roomType: "single",
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

  await prisma.tripUpdate.deleteMany({ where: { bookingId: demoBooking.id } });

  const baseTime = new Date("2026-02-17T06:00:00+05:30");
  const updates = [
    { hoursOffset: 0, locationLabel: "Departed Deoghar", note: "Group departed for Madhuban, all well.", healthStatus: "ok" as const, healthBp: "126/82", healthSugar: "108", healthTemp: "98.2" },
    { hoursOffset: 3, locationLabel: "Tonk 4 — Ajitnath Temple", note: "Papa is at Tonk 4 · All well · BP normal", healthStatus: "ok" as const, healthBp: "128/84", healthSugar: "112", healthTemp: "98.4" },
    { hoursOffset: 6, locationLabel: "Returned to Madhuban", note: "Evening rest, medication administered on schedule.", healthStatus: "ok" as const, healthBp: "124/80", healthSugar: "110", healthTemp: "98.3" },
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
