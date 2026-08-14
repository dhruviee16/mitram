export const metadata = { title: "About MITRAM" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        We believe age should never be a reason to stop exploring.
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground">
        <p>
          Parents want to travel. Their children worry about whether they&rsquo;ll be safe
          doing it alone. Most travel products are built for neither — generic itineraries,
          rushed schedules, and zero visibility for the family back home.
        </p>
        <p>
          MITRAM exists to bridge that gap: independence for the traveller, reassurance for
          the family. Every journey is paced slower, accompanied by a dedicated coordinator,
          and — where enabled — visible to the people who care most.
        </p>
        <p className="font-heading text-lg font-semibold text-primary">
          Concern → MITRAM → Confidence.
        </p>
        <p>
          The traveller says &ldquo;I can travel.&rdquo; The child says &ldquo;I don&rsquo;t
          have to worry.&rdquo; MITRAM makes both true at once — you don&rsquo;t have to
          choose between independence and peace of mind.
        </p>
      </div>
    </div>
  );
}
