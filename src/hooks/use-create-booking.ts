import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api";
import type { BookingRequestValues } from "@/lib/validations/booking";

type CreateBookingResult = {
  bookingId: string;
  totalAmount: number;
};

export function useCreateBooking() {
  return useMutation({
    mutationFn: (input: BookingRequestValues) =>
      postJson<CreateBookingResult>("/api/bookings", input),
  });
}
