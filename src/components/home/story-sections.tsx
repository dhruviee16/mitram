import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type StoryRow = {
  image: string;
  imageAlt: string;
  heading: string;
  body: string;
  points: string[];
  ctaLabel: string;
  ctaHref: string;
  reverse?: boolean;
};

const rows: StoryRow[] = [
  {
    image: "/images/story/backpack-traveler.jpg",
    imageAlt: "A senior traveller setting out on a trip",
    heading: "Every journey, planned around them",
    body: "No two seniors travel the same way. Mitram matches a verified Saathi and paces the itinerary to your parent's mobility, medication schedule and comfort — not the other way around.",
    points: [
      "Saathi matched to age, mobility and language",
      "Daily health check-ins logged automatically",
      "Walking intensity and rest stops set in advance",
    ],
    ctaLabel: "See how it works",
    ctaHref: "/how-it-works",
  },
  {
    image: "/images/story/train-window.jpg",
    imageAlt: "A senior traveller looking out of a train window",
    heading: "Family stays close, even from afar",
    body: "The person clicking “Pay” from another city gets the same peace of mind as the one on the road — live location, daily updates and a direct line to the Saathi, all in one dashboard.",
    points: [
      "Live location shared with the family dashboard",
      "Daily check-in photos and status updates",
      "One tap to call the Saathi directly",
    ],
    ctaLabel: "Explore live tracking",
    ctaHref: "/safety",
    reverse: true,
  },
];

export function StorySections() {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        {rows.map((row) => (
          <div
            key={row.heading}
            className={`grid items-center gap-8 sm:grid-cols-2 sm:gap-12 ${
              row.reverse ? "sm:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="relative">
              <div className="absolute -top-6 -left-6 -z-10 size-32 rounded-full bg-accent/25" aria-hidden="true" />
              <div className="absolute -right-4 -bottom-6 -z-10 size-24 rounded-full bg-primary/15" aria-hidden="true" />
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                <Image
                  src={row.image}
                  alt={row.imageAlt}
                  fill
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {row.heading}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">{row.body}</p>
              <ul className="mt-5 flex flex-col gap-2.5" role="list">
                {row.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-6" render={<Link href={row.ctaHref} />}>
                {row.ctaLabel}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
