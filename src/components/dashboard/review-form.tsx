"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateReview } from "@/hooks/use-create-review";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const createReview = useCreateReview();

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Pick a star rating.");
      return;
    }
    try {
      await createReview.mutateAsync({ bookingId, rating, comment: comment || undefined });
      setSubmitted(true);
      toast.success("Thanks for your review.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review.");
    }
  }

  if (submitted) {
    return (
      <Card className="border-primary/30 bg-secondary/30">
        <CardContent className="text-sm text-foreground">
          Thanks, your review has been submitted.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <p className="text-sm font-semibold text-foreground">How was your trip?</p>
        <div className="mt-2">
          <StarRating value={rating} onChange={setRating} label="Your rating" />
        </div>
        <Textarea
          className="mt-3"
          rows={3}
          placeholder="Share how the trip went (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button type="button" className="mt-3 min-h-11" onClick={handleSubmit} disabled={createReview.isPending}>
          {createReview.isPending ? "Submitting..." : "Submit review"}
        </Button>
      </CardContent>
    </Card>
  );
}
