import { Compass, ShieldCheck, Users, Heart } from "lucide-react";

export const metadata = { title: "How MITRAM Works" };

const steps = [
  { icon: Compass, title: "Choose Your Journey", body: "Explore senior-friendly trips, filtered by pace, destination and community." },
  { icon: ShieldCheck, title: "Book With Confidence", body: "Know exactly what is included — hotels, meals, transport, coordinator and insurance — before you pay." },
  { icon: Users, title: "Travel With MITRAM", body: "A dedicated coordinator supports the group throughout, at a comfortable, unrushed pace." },
  { icon: Heart, title: "Stay Connected", body: "Family receives trip updates, photos and live status where enabled." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">How MITRAM Works</h1>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="rounded-lg border border-border bg-card p-5">
            <span className="font-heading text-xs font-bold text-primary">STEP {i + 1}</span>
            <Icon className="mt-2 size-6 text-primary" aria-hidden="true" />
            <p className="mt-2 font-heading text-base font-bold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
