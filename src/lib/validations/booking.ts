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

export const roomCareSchema = z.object({
  travelDate: z.coerce.date().refine((d) => d.getTime() > Date.now(), "Pick a date in the future."),
  roomType: roomTypeSchema,
  specialCareRequests: z.array(z.string()).default([]),
});

export type BookedFor = z.infer<typeof bookedForSchema>;
export type TravelerValues = z.infer<typeof travelerSchema>;
export type RoomCareValues = z.infer<typeof roomCareSchema>;

export const trackingVisibilitySchema = z.object({
  visible: z.boolean(),
});

export const bookingRequestSchema = z.object({
  tripSlug: z.string().min(1),
  bookedFor: bookedForSchema,
  traveler: travelerSchema,
  travelDate: z.coerce.date(),
  roomType: roomTypeSchema,
  specialCareRequests: z.array(z.string()).default([]),
});

export type BookingRequestValues = z.infer<typeof bookingRequestSchema>;
