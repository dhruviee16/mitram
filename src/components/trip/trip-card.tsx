import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Radio, ArrowRight } from "lucide-react";

type TripCardTrip = {
  slug: string;
  title: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  images: string[];
  careFeatures: string[];
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=70";

export function TripCard({ trip }: { trip: TripCardTrip }) {
  const image = trip.images[0] ?? FALLBACK_IMAGE;
  const [firstFeature, secondFeature] = trip.careFeatures;

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative h-40 w-full">
        <Image
          src={image}
          alt={`${trip.title} — ${trip.routeSummary}`}
          fill
          sizes="(min-width: 768px) 320px, 90vw"
          className="object-cover"
        />
        <span className="absolute right-2 top-2 rounded bg-accent px-2 py-1 text-[11px] font-bold text-accent-foreground">
          {trip.durationDays}D/{trip.durationNights}N
        </span>
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-foreground">
            {trip.title}
          </h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {trip.routeSummary}
        </p>

        {(firstFeature || secondFeature) && (
          <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-xs text-foreground">
            {firstFeature && (
              <span className="flex items-center gap-1.5">
                <ShieldCheck
                  className="size-3.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {firstFeature}
              </span>
            )}
            {secondFeature && (
              <span className="flex items-center gap-1.5">
                <Radio
                  className="size-3.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {secondFeature}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="font-heading text-lg font-bold text-foreground">
            ₹{trip.basePrice.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              /person
            </span>
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary">
            View trip
            <ArrowRight
              className="size-3.5 transition-transform motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
