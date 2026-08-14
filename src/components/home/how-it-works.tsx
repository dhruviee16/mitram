const steps = [
  {
    title: "Tell us who's travelling",
    description:
      "Age, mobility, medication and dietary needs — set once, applied to every booking.",
  },
  {
    title: "We match care to the trip",
    description:
      "A verified Saathi companion, medical kit and paced itinerary get assigned before departure.",
  },
  {
    title: "You track it, live",
    description:
      "Location, daily vitals and check-ins land in your dashboard — wherever you are.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border bg-secondary px-4 py-10 sm:px-6"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
          Booking for someone else? Here&rsquo;s how it works
        </h2>
        <div className="mt-8 grid gap-7 text-left sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title}>
              <span className="flex size-8 items-center justify-center rounded-full bg-primary font-heading font-bold text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="mt-3 text-[15px] font-bold text-foreground">{step.title}</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
