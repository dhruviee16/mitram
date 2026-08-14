import { z } from "zod";

export const familyConnectionSchema = z.object({
  name: z.string().min(1, "Enter a name."),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  relationship: z.string().min(1, "Enter the relationship."),
  tripUpdates: z.boolean().default(true),
  arrivalUpdates: z.boolean().default(true),
  photos: z.boolean().default(true),
  liveLocation: z.boolean().default(false),
  emergencyNotifications: z.boolean().default(true),
});

export type FamilyConnectionValues = z.infer<typeof familyConnectionSchema>;

export const familyPermissionsSchema = z.object({
  tripUpdates: z.boolean().optional(),
  arrivalUpdates: z.boolean().optional(),
  photos: z.boolean().optional(),
  liveLocation: z.boolean().optional(),
  emergencyNotifications: z.boolean().optional(),
});
