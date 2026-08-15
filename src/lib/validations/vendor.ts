import { z } from "zod";
import { TRIP_CATEGORIES } from "@/lib/trip-categories";
import { parseRouteStops } from "@/lib/format-route";

const categoryValues = TRIP_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

function listFromLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function listFromCsv(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// zodResolver hands react-hook-form's onSubmit the *transformed* (output) value,
// so a client submit re-sends an already-split array here — accept both shapes
// since this schema is reused to re-validate on the server.
const csvOrArray = z
  .union([z.string().transform(listFromCsv), z.array(z.string())])
  .default([]);

export const vendorRegisterSchema = z.object({
  businessName: z.string().min(1, "Enter your business name."),
  ownerName: z.string().min(1, "Enter the owner's name."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z
    .string()
    .min(6, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  gst: z.string().optional().or(z.literal("")),
  pan: z.string().optional().or(z.literal("")),
  businessAddress: z.string().optional().or(z.literal("")),
  yearsInBusiness: z.coerce.number().int().min(0).optional(),
  destinationsServed: csvOrArray,
  website: z.string().optional().or(z.literal("")),
});

export type VendorRegisterValues = z.infer<typeof vendorRegisterSchema>;

export const vendorTripDaySchema = z.object({
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().min(1, "Enter a day title."),
  description: z.string().min(1, "Enter a day description."),
  activities: z.string().transform(listFromLines).default([]),
});

export const vendorTripDateSchema = z.object({
  departureDate: z.string().min(1, "Pick a departure date."),
  seatsTotal: z.coerce.number().int().min(1).default(20),
});

export const walkingIntensityValues = [
  "easy",
  "moderate",
  "challenging",
] as const;
export const mealsPlanValues = ["breakfast", "lunch", "dinner"] as const;

export const vendorTripSchema = z.object({
  title: z.string().min(1, "Enter a trip title."),
  category: z.enum(categoryValues),
  destinationId: z.string().optional(),
  routeSummary: z
    .string()
    .min(1, "Enter a route summary.")
    .refine(
      (value) => parseRouteStops(value).length >= 2,
      "Add at least 2 stops so the route can be tracked (e.g. Delhi, Haridwar, Rishikesh).",
    ),
  durationDays: z.coerce.number().int().min(1),
  durationNights: z.coerce.number().int().min(0),
  basePrice: z.coerce.number().int().min(1),
  images: z.array(z.string()).default([]),
  careFeatures: z.string().transform(listFromLines).default([]),
  inclusions: z.string().transform(listFromLines).default([]),
  exclusions: z.string().transform(listFromLines).default([]),
  summary: z.string().min(1, "Enter a trip summary."),
  walkingIntensity: z.enum(walkingIntensityValues).default("easy"),
  groupSizeMin: z.coerce.number().int().min(1).optional(),
  groupSizeMax: z.coerce.number().int().min(1).optional(),
  ageGroupMin: z.coerce.number().int().min(0).optional(),
  ageGroupMax: z.coerce.number().int().min(0).optional(),
  hotelCategory: z.coerce.number().int().min(1).max(5).optional(),
  mealsPlan: z.array(z.enum(mealsPlanValues)).default([]),
  insuranceIncluded: z.boolean().default(false),
  coordinatorIncluded: z.boolean().default(true),
  accessibilityNotes: z.string().optional().or(z.literal("")),
  days: z.array(vendorTripDaySchema).min(1, "Add at least one itinerary day."),
  dates: z
    .array(vendorTripDateSchema)
    .min(1, "Add at least one departure date."),
});

export type VendorTripValues = z.infer<typeof vendorTripSchema>;

export const vendorTripUpdateSchema = z.object({
  locationLabel: z.string().min(1, "Choose a stop."),
  note: z.string().optional(),
  photoUrl: z.string().optional(),
  healthBp: z.string().optional(),
  healthSugar: z.string().optional(),
  healthTemp: z.string().optional(),
  healthStatus: z.enum(["ok", "monitor"]).optional(),
});

export type VendorTripUpdateValues = z.infer<typeof vendorTripUpdateSchema>;
