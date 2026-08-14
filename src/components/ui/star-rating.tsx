"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "default",
  label = "Rating",
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "default";
  label?: string;
}) {
  const starSize = size === "sm" ? "size-4" : "size-6";

  if (readOnly) {
    return (
      <div className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(starSize, star <= Math.round(value) ? "fill-accent text-accent" : "fill-none text-muted-foreground")}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange?.(star)}
          className="flex size-11 items-center justify-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className={cn(starSize, star <= value ? "fill-accent text-accent" : "fill-none text-muted-foreground")}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
