import { Circle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TripDay = {
  dayNumber: number;
  title: string;
  description: string;
  activities: string[];
};

export function ItinerarySection({
  days,
  summary,
  inclusions,
  careFeatures,
}: {
  days: TripDay[];
  summary: string;
  inclusions: string[];
  careFeatures: string[];
}) {
  const itineraryDays = days.map((day) => ({
    ...day,
    value: `day-${day.dayNumber}`,
  }));

  if (days.length === 0) {
    return (
      <div className="grid gap-6">
        <section
          aria-labelledby="trip-overview-heading"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <h2
            id="trip-overview-heading"
            className="font-heading text-xl font-bold text-foreground"
          >
            About this trip
          </h2>
          <p className="mt-3 text-sm leading-7 text-foreground">{summary}</p>
        </section>

        {inclusions.length > 0 && (
          <section
            aria-labelledby="included-heading"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h3
              id="included-heading"
              className="font-heading text-lg font-bold text-foreground"
            >
              What&rsquo;s included
            </h3>
            <ul
              className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2"
              role="list"
            >
              {inclusions.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-border/70 bg-secondary/40 px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  return (
    <section aria-labelledby="trip-details-heading" className="space-y-4">
      <h2 id="trip-details-heading" className="sr-only">
        Trip details
      </h2>

      <Tabs defaultValue="itinerary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary" className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-foreground">
              Day-by-day itinerary
            </h3>
            <Accordion
              defaultValue={[itineraryDays[0]?.value ?? ""]}
              className="mt-4"
              multiple
            >
              {itineraryDays.map((day) => (
                <AccordionItem key={day.value} value={day.value}>
                  <AccordionTrigger className="py-4 text-left">
                    <div className="flex items-center gap-3 pr-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                        {day.dayNumber}
                      </span>
                      <span className="font-heading text-base font-bold text-foreground">
                        {day.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="space-y-3 pl-11 text-sm text-foreground">
                      <p className="leading-7 text-muted-foreground">
                        {day.description}
                      </p>
                      {day.activities.length > 0 && (
                        <ul className="grid gap-2 sm:grid-cols-2" role="list">
                          {day.activities.map((activity) => (
                            <li key={activity} className="flex items-start gap-2">
                              <Circle
                                className="mt-1.5 size-1.5 shrink-0 fill-primary text-primary"
                                aria-hidden="true"
                              />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:grid-cols-2">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                Care features
              </h3>
              <ul
                className="mt-4 space-y-2 text-sm text-muted-foreground"
                role="list"
              >
                {careFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-lg border border-border/70 bg-secondary/30 px-3 py-2 text-foreground"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                Support notes
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>
                  All departures are paced for comfort, with rest stops and
                  assisted transfers planned around senior travelers.
                </p>
                <p>
                  Family visibility and health updates are part of the MITRAM
                  operating model for assisted journeys.
                </p>
                <p>
                  Final inclusions and exact support arrangements are confirmed
                  again before departure.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:grid-cols-[1.35fr_1fr]">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                Trip summary
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {summary}
              </p>
            </div>

            {inclusions.length > 0 && (
              <div>
                <h4 className="font-heading text-lg font-bold text-foreground">
                  What&rsquo;s included
                </h4>
                <ul
                  className="mt-4 space-y-2 text-sm text-muted-foreground"
                  role="list"
                >
                  {inclusions.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-border/70 bg-secondary/30 px-3 py-2 text-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
