import Image from "next/image";

// Placeholder testimonials — Mitram is pre-launch with no real customers yet.
// Replace with real quotes once available; this is the one section the design
// spec explicitly sanctions placeholder content for.
const testimonials = [
  {
    quote:
      "I could see exactly where Papa was on the Shikharji trek, every step. That mattered more than anything else.",
    name: "Arjun J.",
    role: "Son, booked from Dubai",
  },
  {
    quote:
      "The companion knew Ma's medication schedule better than I did some days. That's what peace of mind looks like.",
    name: "Priya S.",
    role: "Daughter, Bangalore",
  },
  {
    quote: "First trip in years where I didn't feel like a burden on anyone.",
    name: "Ramesh J.",
    role: "Traveler, 72",
  },
];

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="px-4 py-8 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="relative mb-6 h-40 w-full overflow-hidden rounded-lg sm:h-56">
          <Image
            src="/images/trips/dwarka-rann-of-kutch-1.jpg"
            alt="Senior pilgrims gathered at a temple courtyard"
            fill
            sizes="(min-width: 1024px) 1152px, 100vw"
            className="object-cover"
          />
        </div>
        <h2
          id="testimonials-heading"
          className="font-heading text-xl font-bold text-foreground"
        >
          What families say
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3" role="list">
          {testimonials.map((t) => (
            <li
              key={t.name}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="text-sm italic text-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-3 text-xs font-semibold text-foreground">
                {t.name}
              </p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
