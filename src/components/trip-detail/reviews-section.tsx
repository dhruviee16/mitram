"use client";

import Image from "next/image";
import { StarRating } from "@/components/ui/star-rating";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  images: string[];
  createdAt: Date;
  user: { name: string };
};

export function ReviewsSection({
  reviews,
  average,
  count,
}: {
  reviews: Review[];
  average: number;
  count: number;
}) {
  if (count === 0) return null;

  return (
    <section aria-labelledby="reviews-heading">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <h2 id="reviews-heading" className="font-heading text-lg font-bold text-foreground">
              Traveller reviews
            </h2>
            <div className="flex items-center gap-2">
              <StarRating value={average} readOnly size="sm" />
              <span className="text-sm font-semibold text-foreground">{average.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({count})</span>
            </div>
          </div>
          <ul className="mt-4 space-y-4" role="list">
            {reviews.map((review) => (
              <li key={review.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{review.user.name}</p>
                  <StarRating value={review.rating} readOnly size="sm" />
                </div>
                {review.comment && <p className="mt-1.5 text-sm text-muted-foreground">{review.comment}</p>}
                {review.images.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto">
                    {review.images.map((url) => (
                      <Dialog key={url}>
                        <DialogTrigger
                          className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={`View full photo from ${review.user.name}'s review`}
                        >
                          <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                        </DialogTrigger>
                        <DialogContent
                          showCloseButton
                          className="max-w-[calc(100%-2rem)] p-1 sm:max-w-2xl"
                        >
                          <div className="relative h-[70vh] w-full overflow-hidden rounded-lg">
                            <Image
                              src={url}
                              alt=""
                              fill
                              sizes="(min-width: 640px) 640px, 100vw"
                              className="object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
