"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdateReview, type ReviewInput } from "@/hooks/use-update-review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { ImageUpload } from "@/components/ui/image-upload";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ReviewForm({ id, defaultValues }: { id: string; defaultValues: ReviewInput }) {
  const router = useRouter();
  const updateReview = useUpdateReview(id);
  const [images, setImages] = useState(defaultValues.images);

  const form = useForm<ReviewInput>({ defaultValues });

  function onSubmit(values: ReviewInput) {
    updateReview.mutate(
      { ...values, images },
      {
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save review."),
        onSuccess: () => {
          toast.success("Review updated.");
          router.push("/admin/reviews");
          router.refresh();
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <StarRating value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Photos</FormLabel>
          <ImageUpload value={images} onChange={setImages} />
        </FormItem>

        <Button type="submit" className="min-h-11" disabled={updateReview.isPending}>
          {updateReview.isPending ? "Saving..." : "Save review"}
        </Button>
      </form>
    </Form>
  );
}
