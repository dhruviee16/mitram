import { DestinationCard, type PublishedDestination } from "@/components/destinations/destination-card";
import { cn } from "@/lib/utils";

const BENTO_POSITION = [
  "md:col-start-1 md:row-start-1 md:row-span-2",
  "md:col-start-2 md:row-start-1",
  "md:col-start-2 md:row-start-2",
  "md:col-start-3 md:row-start-1 md:row-span-2",
  "md:col-start-4 md:row-start-1",
  "md:col-start-4 md:row-start-2",
];

export function DestinationInspiration({
  destinations,
}: {
  destinations: PublishedDestination[];
}) {
  if (destinations.length === 0) return null;

  return (
    <section className="px-4 pt-2 pb-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Where families are going this season
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:auto-rows-46">
          {destinations.map((destination, index) => {
            const isBig = index === 0 || index === 3;
            return (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                large={isBig}
                className={cn(BENTO_POSITION[index])}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
