import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api";
import type { ReviewValues } from "@/lib/validations/review";

export function useCreateReview() {
  return useMutation({
    mutationFn: (input: ReviewValues) => postJson<{ id: string }>("/api/reviews", input),
  });
}
