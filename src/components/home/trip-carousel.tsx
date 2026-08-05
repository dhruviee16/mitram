import { TripCard } from "@/components/trip/trip-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

type Trip = Parameters<typeof TripCard>[0]["trip"];

export function TripCarousel({ trips }: { trips: Trip[] }) {
  return (
    <section aria-labelledby="carousel-heading" className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 id="carousel-heading" className="font-heading text-xl font-bold text-foreground">
          Mitram&rsquo;s Most-Loved Yatras
        </h2>
        <Carousel opts={{ align: "start" }} className="mt-4">
          <CarouselContent>
            {trips.map((trip) => (
              <CarouselItem key={trip.slug} className="basis-[85%] sm:basis-1/2 lg:basis-1/3">
                <TripCard trip={trip} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
