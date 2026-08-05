import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api";

type CreateOrderResult = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (bookingId: string) =>
      postJson<CreateOrderResult>("/api/payments/create-order", { bookingId }),
  });
}
