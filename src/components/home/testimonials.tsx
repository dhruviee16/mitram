type Testimonial = {
  id: string;
  name: string;
  city: string | null;
  tripTitle: string | null;
  quote: string;
};

// Testimonials are admin-managed (Testimonial model, isSample flag) — Mitram is
// pre-launch, so seeded rows are clearly marked as sample content per spec.
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="px-4 py-8 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="testimonials-heading"
          className="font-heading text-xl font-bold text-foreground"
        >
          Loved by travellers. Trusted by families.
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3" role="list">
          {testimonials.map((t) => (
            <li
              key={t.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="text-sm italic text-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-3 text-xs font-semibold text-foreground">
                {t.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {[t.tripTitle, t.city].filter(Boolean).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
