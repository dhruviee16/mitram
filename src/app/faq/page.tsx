export const metadata = { title: "FAQ — MITRAM" };

const faqs = [
  { q: "Who are MITRAM trips designed for?", a: "Indian travellers aged 40+ who want to travel comfortably, with a slower pace, verified support and companionship — often alongside people of a similar age group." },
  { q: "Is there always a coordinator on the trip?", a: "Every MITRAM group trip has a dedicated coordinator accompanying the group for check-ins, transfers and daily coordination." },
  { q: "Can my family see where I am during the trip?", a: "Yes, if you enable tracking visibility for a linked family connection. You control exactly what is shared and can turn it off at any time." },
  { q: "What if I need medical assistance during the trip?", a: "Wellness support (where available) includes vitals checks and an emergency escalation plan. This is operational support, not a substitute for professional medical care." },
  { q: "Is travel insurance included?", a: "This depends on the specific trip — each trip page clearly states whether insurance is included or available as an add-on." },
  { q: "How do I become a MITRAM travel partner?", a: "Apply via the vendor registration page. Every partner goes through identity, business, experience and safety verification before trips go live." },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Frequently asked questions</h1>
      <div className="mt-8 space-y-6">
        {faqs.map(({ q, a }) => (
          <div key={q}>
            <p className="font-heading text-base font-bold text-foreground">{q}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
