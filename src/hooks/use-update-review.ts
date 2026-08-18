import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/api";

export type ReviewInput = {
  rating: number;
  comment: string;
  images: string[];
};

export function useUpdateReview(id: string) {
  return useMutation({
    mutationFn: (values: ReviewInput) => patchJson<{ id: string }>(`/api/admin/reviews/${id}`, values),
  });
}
