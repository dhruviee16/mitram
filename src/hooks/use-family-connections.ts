import { useMutation } from "@tanstack/react-query";
import { postJson, patchJson, deleteJson } from "@/lib/api";

export type FamilyConnection = {
  id: string;
  name: string;
  relationship: string;
  email: string | null;
  phone: string | null;
  tripUpdates: boolean;
  arrivalUpdates: boolean;
  photos: boolean;
  liveLocation: boolean;
  emergencyNotifications: boolean;
};

export function useAddFamilyConnection() {
  return useMutation({
    mutationFn: (
      body: Pick<FamilyConnection, "name" | "relationship" | "email" | "phone"> &
        Partial<Pick<FamilyConnection, "tripUpdates" | "arrivalUpdates" | "photos" | "liveLocation" | "emergencyNotifications">>,
    ) => postJson<FamilyConnection>("/api/family-connections", body),
  });
}

export function useUpdateFamilyConnection() {
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<FamilyConnection>) =>
      patchJson(`/api/family-connections/${id}`, body),
  });
}

export function useRemoveFamilyConnection() {
  return useMutation({
    mutationFn: (id: string) => deleteJson(`/api/family-connections/${id}`),
  });
}
