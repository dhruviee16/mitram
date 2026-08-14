const deals = [
  { headline: "₹6,000 off", detail: "on Char Dham Yatra, book before Aug 31" },
  { headline: "Free upgrade", detail: "to a dedicated Saathi on Bhutan trips" },
  { headline: "Early bird", detail: "10% off the Jyotirlinga Circuit" },
  { headline: "Refer & save", detail: "₹2,000 for every family you bring along" },
];

function DealCard({ headline, detail }: (typeof deals)[number]) {
  return (
    <div className="flex min-w-[240px] shrink-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
      <span className="font-heading text-lg font-bold text-primary">{headline}</span>
      <span className="text-[13px] text-muted-foreground">{detail}</span>
    </div>
  );
}

export function DealsStrip() {
  return (
    <section className="overflow-hidden border-b border-border bg-secondary py-5">
      <div className="marquee-track flex w-max gap-4 px-4 sm:px-6">
        {[...deals, ...deals].map((deal, i) => (
          <DealCard key={`${deal.headline}-${i}`} {...deal} />
        ))}
      </div>
    </section>
  );
}
