import Image from "next/image";

export const metadata = { title: "About MITRAM" };

export default function AboutPage() {
  return (
    <section className="relative overflow-hidden bg-background lg:min-h-184 xl:min-h-200">
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-8">
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-foreground">
            Our story
          </span>
          <h1 className="mt-4 max-w-2xl font-heading text-3xl leading-[1.1] font-extrabold text-foreground sm:text-4xl lg:text-5xl">
            We believe age should never be a reason to stop exploring.
          </h1>

          <div className="mt-6 max-w-xl space-y-4 text-sm leading-relaxed text-foreground">
            <p>
              Parents want to travel. Their children worry about whether they&rsquo;ll be safe
              doing it alone. Most travel products are built for neither: generic itineraries,
              rushed schedules, and zero visibility for the family back home.
            </p>
            <p>
              MITRAM exists to bridge that gap: independence for the traveller, reassurance for
              the family. Every journey is paced slower, accompanied by a dedicated coordinator,
              and, where enabled, visible to the people who care most.
            </p>
            <p className="font-heading text-lg font-semibold text-primary">
              Concern → MITRAM → Confidence.
            </p>
            <p>
              The traveller says &ldquo;I can travel.&rdquo; The child says &ldquo;I don&rsquo;t
              have to worry.&rdquo; MITRAM makes both true at once: you don&rsquo;t have to
              choose between independence and peace of mind.
            </p>
          </div>
        </div>

        <div aria-hidden="true" className="hidden lg:block" />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] lg:block"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 16%)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 16%)",
        }}
      >
        <Image
          src="/images/story/family-connection.png"
          alt="A senior couple exploring Amer Fort while their daughter follows along on her phone at home"
          fill
          priority
          unoptimized
          sizes="56vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}
