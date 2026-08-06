export { signupSchema as vendorSignupSchema, type SignupValues as VendorSignupValues } from "@/lib/validations/auth";

import { z } from "zod";
import { TRIP_CATEGORIES } from "@/lib/trip-categories";

const categoryValues = TRIP_CATEGORIES.map((c) => c.value) as [string, ...string[]];

function listFromLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export const vendorTripDaySchema = z.object({
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().min(1, "Enter a day title."),
  description: z.string().min(1, "Enter a day description."),
  activities: z.string().transform(listFromLines).default([]),
});

export const vendorTripSchema = z.object({
  title: z.string().min(1, "Enter a trip title."),
  category: z.enum(categoryValues),
  routeSummary: z.string().min(1, "Enter a route summary."),
  durationDays: z.coerce.number().int().min(1),
  durationNights: z.coerce.number().int().min(0),
  basePrice: z.coerce.number().int().min(1),
  images: z.array(z.string()).default([]),
  careFeatures: z.string().transform(listFromLines).default([]),
  inclusions: z.string().transform(listFromLines).default([]),
  summary: z.string().min(1, "Enter a trip summary."),
  days: z.array(vendorTripDaySchema).min(1, "Add at least one itinerary day."),
});

export type VendorTripValues = z.infer<typeof vendorTripSchema>;

export const vendorTripUpdateSchema = z.object({
  locationLabel: z.string().min(1, "Enter a location."),
  note: z.string().optional(),
  healthBp: z.string().optional(),
  healthSugar: z.string().optional(),
  healthTemp: z.string().optional(),
  healthStatus: z.enum(["ok", "monitor"]).optional(),
});

export type VendorTripUpdateValues = z.infer<typeof vendorTripUpdateSchema>;
