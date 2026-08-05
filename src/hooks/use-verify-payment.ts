import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api";

type VerifyPaymentInput = {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

type VerifyPaymentResult = {
  confirmed: true;
};

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (input: VerifyPaymentInput) =>
      postJson<VerifyPaymentResult>("/api/payments/verify", input),
  });
}
