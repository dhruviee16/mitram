import { HeartPulse, Radio, ShieldCheck, Users } from "lucide-react";

const pillars = [
  { icon: HeartPulse, label: "Medical support" },
  { icon: Radio, label: "Live family tracking" },
  { icon: ShieldCheck, label: "Police-verified Saathi" },
  { icon: Users, label: "Senior-first pacing" },
];

export function TrustPillars() {
  return (
    <section aria-label="Why families trust Mitram" className="border-y border-border bg-secondary px-4 py-8 sm:px-6">
      <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8" role="list">
        {pillars.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon className="size-6 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
