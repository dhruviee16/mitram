import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api";
import type { BookedFor, TravelerValues, RoomCareValues } from "@/lib/validations/booking";

type CreateBookingInput = {
  tripSlug: string;
  bookedFor: BookedFor;
  traveler: TravelerValues;
  travelDate: Date;
  roomType: RoomCareValues["roomType"];
  specialCareRequests: string[];
};

type CreateBookingResult = {
  bookingId: string;
  totalAmount: number;
};

export function useCreateBooking() {
  return useMutation({
    mutationFn: (input: CreateBookingInput) =>
      postJson<CreateBookingResult>("/api/bookings", input),
  });
}
