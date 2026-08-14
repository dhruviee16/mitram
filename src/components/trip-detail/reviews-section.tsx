import { StarRating } from "@/components/ui/star-rating";
import { Card, CardContent } from "@/components/ui/card";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
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
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
