import { z } from "zod";

export const bookedForSchema = z.enum(["self", "parent", "nri"]);

export const travelerSchema = z.object({
  name: z.string().min(1, "Enter the traveler's name."),
  age: z.coerce.number().int().min(1, "Enter a valid age.").max(120, "Enter a valid age."),
  relationship: z.string().min(1, "Enter the relationship to the booker."),
  healthNotes: z.array(z.string()).default([]),
  dietaryNeeds: z.array(z.string()).default([]),
});

export const roomTypeSchema = z.enum(["single", "twin", "triple"]);

export type BookedFor = z.infer<typeof bookedForSchema>;
export type TravelerValues = z.infer<typeof travelerSchema>;

export const trackingVisibilitySchema = z.object({
  visible: z.boolean(),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Enter an emergency contact name."),
  phone: z.string().min(6, "Enter a valid phone number."),
  relation: z.string().min(1, "Enter the relationship."),
});

export const familyContactSchema = z.object({
  link: z.boolean().default(false),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  relationship: z.string().optional(),
});

export type EmergencyContactValues = z.infer<typeof emergencyContactSchema>;
export type FamilyContactValues = z.infer<typeof familyContactSchema>;

export const bookingRequestSchema = z.object({
  tripSlug: z.string().min(1),
  tripDateId: z.string().min(1, "Select a departure date."),
  bookedFor: bookedForSchema,
  travelers: z.array(travelerSchema).min(1, "Add at least one traveler."),
  roomType: roomTypeSchema,
  specialCareRequests: z.array(z.string()).default([]),
  emergencyContact: emergencyContactSchema,
  familyContact: familyContactSchema,
  insuranceOpted: z.boolean().default(false),
});

export type BookingRequestValues = z.infer<typeof bookingRequestSchema>;
