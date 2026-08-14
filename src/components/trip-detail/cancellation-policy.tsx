const POLICY_ITEMS = [
  { title: "Booking & payments", body: "Full payment is required to confirm your trip. Partial payments may be accepted at MITRAM's discretion; registration timelines and requirements will be shared at the time of booking." },
  { title: "Cancellation timeline & fees", body: "60+ days before departure: 10% fee · 30–59 days: 50% fee · 15–29 days: 75% fee · Under 15 days: non-refundable. Unused services are non-refundable." },
  { title: "Changes & modifications", body: "MITRAM may make changes to the itinerary, accommodation or transport if required due to safety, weather or vendor availability, with efforts to inform travellers in advance." },
  { title: "Hotel check-in & check-out", body: "Standard hotel check-in/check-out timings apply unless otherwise mentioned. Early check-in or late check-out may attract additional charges." },
  { title: "Travel insurance", body: "Travellers are encouraged to opt in for travel insurance where available. See the trip's inclusions for whether insurance is bundled." },
  { title: "Refund processing", body: "Approved refunds are processed within 7–14 working days to the original payment method." },
];

export function CancellationPolicy() {
  return (
    <section aria-labelledby="cancellation-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 id="cancellation-heading" className="font-heading text-lg font-bold text-foreground">
        Our Cancellation Policy
      </h2>
      <div className="mt-4 space-y-4">
        {POLICY_ITEMS.map((item) => (
          <div key={item.title}>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
