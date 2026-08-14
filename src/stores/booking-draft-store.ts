import { create } from "zustand";

export type BookingTraveler = {
  name: string;
  age: number | "";
  relationship: string;
  healthNotes: string[];
  dietaryNeeds: string[];
};

export type BookingDraft = {
  tripSlug: string | null;
  tripDateId: string | null;
  bookedFor: "self" | "parent" | "nri" | null;
  travelers: BookingTraveler[];
  roomType: string | null;
  specialCareRequests: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  familyContactName: string;
  familyContactEmail: string;
  familyContactPhone: string;
  familyContactRelationship: string;
  linkFamilyContact: boolean;
  insuranceOpted: boolean;
};

const emptyDraft: BookingDraft = {
  tripSlug: null,
  tripDateId: null,
  bookedFor: null,
  travelers: [],
  roomType: null,
  specialCareRequests: [],
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  familyContactName: "",
  familyContactEmail: "",
  familyContactPhone: "",
  familyContactRelationship: "",
  linkFamilyContact: false,
  insuranceOpted: false,
};

type BookingDraftState = {
  draft: BookingDraft;
  startDraft: (tripSlug: string) => void;
  update: (patch: Partial<BookingDraft>) => void;
  addTraveler: (traveler: BookingTraveler) => void;
  updateTraveler: (index: number, patch: Partial<BookingTraveler>) => void;
  removeTraveler: (index: number) => void;
  reset: () => void;
};

export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  draft: emptyDraft,
  startDraft: (tripSlug) => set({ draft: { ...emptyDraft, tripSlug } }),
  update: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  addTraveler: (traveler) =>
    set((state) => ({ draft: { ...state.draft, travelers: [...state.draft.travelers, traveler] } })),
  updateTraveler: (index, patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        travelers: state.draft.travelers.map((t, i) => (i === index ? { ...t, ...patch } : t)),
      },
    })),
  removeTraveler: (index) =>
    set((state) => ({
      draft: { ...state.draft, travelers: state.draft.travelers.filter((_, i) => i !== index) },
    })),
  reset: () => set({ draft: emptyDraft }),
}));
