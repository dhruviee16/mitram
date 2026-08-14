import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Testimonial = {
  id: string;
  name: string;
  city: string | null;
  tripTitle: string | null;
  quote: string;
};

function DecorIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-0 left-0 z-1 size-3.5 shrink-0 -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] stroke-1 stroke-muted-foreground",
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function QuoteIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}

// Testimonials are admin-managed (Testimonial model, isSample flag) — Mitram is
// pre-launch, so seeded rows are clearly marked as sample content per spec.
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-heading" className="px-4 pt-12 pb-32 sm:px-6 sm:pb-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Testimonials
          </p>
          <h2 id="testimonials-heading" className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Loved by travellers. Trusted by families.
          </h2>
        </div>

        <ul
          className="mx-auto -mt-2 grid w-full max-w-5xl gap-8 pt-10 md:grid-cols-3 md:gap-6"
          role="list"
        >
          {testimonials.map((t, index) => (
            <li key={t.id}>
              <figure
                className="group relative flex h-full flex-col justify-between gap-6 px-8 pt-8 pb-6 md:translate-y-[calc(3rem*var(--t-card-index))]"
                style={{ "--t-card-index": index % 3 } as React.CSSProperties}
              >
                <div className="absolute -inset-y-4 -left-px w-px bg-border" />
                <div className="absolute -inset-y-4 -right-px w-px bg-border" />
                <div className="absolute -inset-x-4 -top-px h-px bg-border" />
                <div className="absolute -right-4 -bottom-px -left-4 h-px bg-border" />
                <DecorIcon />

                <blockquote className="flex gap-4">
                  <QuoteIcon className="size-6 shrink-0 stroke-1 text-muted-foreground" />
                  <p className="flex-1 text-base leading-relaxed font-normal text-muted-foreground">
                    {t.quote}
                  </p>
                </blockquote>

                <figcaption className="flex items-center gap-3">
                  <Avatar className="ring-2 ring-border ring-offset-2 ring-offset-background transition-shadow group-hover:ring-foreground/20">
                    <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <cite className="text-sm font-medium text-foreground not-italic">
                      {t.name}
                    </cite>
                    {(t.tripTitle || t.city) && (
                      <p className="text-xs text-muted-foreground">
                        {[t.tripTitle, t.city].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
