import { UserPlus, HeartHandshake, Radar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: UserPlus,
    title: "Tell us who's travelling",
    copy: "Age, mobility, medication and dietary needs — set once, applied to every booking.",
  },
  {
    icon: HeartHandshake,
    title: "We match care to the trip",
    copy: "A verified Saathi companion, medical kit and paced itinerary get assigned before departure.",
  },
  {
    icon: Radar,
    title: "You track it, live",
    copy: "Location, daily vitals and check-ins land in your dashboard — wherever you are.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border bg-secondary px-6 py-16 text-foreground"
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-10">
          <Badge variant="outline" className="mb-4">
            How it works
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Booking for someone else? Here&rsquo;s how it works
          </h2>
        </div>

        <ol className="flex flex-col">
          {steps.map(({ icon: Icon, title, copy }, index) => {
            const isLast = index === steps.length - 1;
            return (
              <li key={title} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                  </span>
                  {!isLast && <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />}
                </div>

                <div className={isLast ? "pb-0" : "pb-10"}>
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{copy}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
