import { useMutation } from "@tanstack/react-query";
import { patchJson, deleteJson } from "@/lib/api";

export function useSetTestimonialFeatured() {
  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      patchJson(`/api/admin/testimonials/${id}`, { featured }),
  });
}

export function useDeleteTestimonial() {
  return useMutation({
    mutationFn: (id: string) => deleteJson(`/api/admin/testimonials/${id}`),
  });
}
