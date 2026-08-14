import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeCta() {
  return (
    <section className="relative overflow-hidden px-4 py-16 text-center sm:px-6 sm:py-20">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/scenes/mountain-road.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" />
      </div>
      <h2 className="font-heading text-2xl font-extrabold text-primary-foreground sm:text-3xl">
        Ready to plan their next yatra?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/85 sm:text-base">
        A verified Saathi, a paced itinerary and live updates for the family — booked in minutes.
      </p>
      <Button size="lg" className="mt-6" render={<Link href="/trips" />}>
        Explore trips
      </Button>
    </section>
  );
}
