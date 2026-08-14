import { TripCard } from "@/components/trip/trip-card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

type Trip = Parameters<typeof TripCard>[0]["trip"];

export function RelatedTrips({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) return null;

  return (
    <section aria-labelledby="related-trips-heading">
      <h2 id="related-trips-heading" className="font-heading text-lg font-bold text-foreground">
        More trips you may like
      </h2>
      <Carousel opts={{ align: "start" }} className="mt-4">
        <CarouselContent>
          {trips.map((trip) => (
            <CarouselItem key={trip.slug} className="basis-[85%] sm:basis-1/2">
              <TripCard trip={trip} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </section>
  );
}
