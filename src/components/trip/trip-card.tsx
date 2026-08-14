import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Footprints, UtensilsCrossed, Users, ArrowRight } from "lucide-react";
import { formatRoute } from "@/lib/format-route";

type TripCardTrip = {
  slug: string;
  title: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  images: string[];
  walkingIntensity: string;
  mealsPlan: string[];
  coordinatorIncluded: boolean;
  groupSizeMin: number | null;
  groupSizeMax: number | null;
  vendor: { vendorProfile: { verificationStatus: string } | null } | null;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=70";

const WALKING_LABEL: Record<string, string> = {
  easy: "Easy walking",
  moderate: "Moderate walking",
  challenging: "Challenging walking",
};

export function TripCard({ trip }: { trip: TripCardTrip }) {
  const image = trip.images[0] ?? FALLBACK_IMAGE;
  const isVerified = trip.vendor?.vendorProfile?.verificationStatus === "verified";

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative h-40 w-full">
        <Image
          src={image}
          alt={`${trip.title} — ${formatRoute(trip.routeSummary)}`}
          fill
          sizes="(min-width: 768px) 320px, 90vw"
          className="object-cover"
        />
        <span className="absolute right-2 top-2 rounded bg-accent px-2 py-1 text-[11px] font-bold text-accent-foreground">
          {trip.durationDays}D/{trip.durationNights}N
        </span>
        {isVerified && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-card/90 px-2 py-1 text-[11px] font-bold text-primary">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            MITRAM Verified
          </span>
        )}
      </div>

      <div className="border-t border-border p-4">
        <h3 className="font-heading text-base font-bold text-foreground">{trip.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{formatRoute(trip.routeSummary)}</p>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-foreground">
          <span className="flex items-center gap-1">
            <Footprints className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            {WALKING_LABEL[trip.walkingIntensity] ?? trip.walkingIntensity}
          </span>
          {trip.mealsPlan.length > 0 && (
            <span className="flex items-center gap-1">
              <UtensilsCrossed className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              {trip.mealsPlan.length === 3 ? "All meals" : trip.mealsPlan.join(", ")}
            </span>
          )}
          {trip.groupSizeMin && trip.groupSizeMax && (
            <span className="flex items-center gap-1">
              <Users className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              {trip.groupSizeMin}–{trip.groupSizeMax}
            </span>
          )}
        </div>
        {trip.coordinatorIncluded && (
          <p className="mt-1.5 text-[11px] font-semibold text-primary">MITRAM Coordinator included</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="font-heading text-lg font-bold text-foreground">
            ₹{trip.basePrice.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-muted-foreground"> /person</span>
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary">
            View trip
            <ArrowRight className="size-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
