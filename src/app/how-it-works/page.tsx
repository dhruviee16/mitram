import Image from "next/image";
import { Compass, ShieldCheck, Users, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "How MITRAM Works" };

const steps = [
  { icon: Compass, title: "Choose Your Journey", body: "Explore senior-friendly trips, filtered by pace, destination and community." },
  { icon: ShieldCheck, title: "Book With Confidence", body: "Know exactly what is included (hotels, meals, transport, coordinator and insurance) before you pay." },
  { icon: Users, title: "Travel With MITRAM", body: "A dedicated coordinator supports the group throughout, at a comfortable, unrushed pace." },
  { icon: Heart, title: "Stay Connected", body: "Family receives trip updates, photos and live status where enabled." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">How MITRAM Works</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        A simple, seamless journey from start to finish.
      </p>

      <div
        className="relative mx-auto mt-8 aspect-2004/785 w-full"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent), linear-gradient(to bottom, transparent, black 12%, black 85%, transparent)",
          maskComposite: "intersect",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent), linear-gradient(to bottom, transparent, black 12%, black 85%, transparent)",
        }}
      >
        <Image
          src="/images/how-it-works/journey-strip.png"
          alt="Seniors travelling with MITRAM: choosing a trip, booking confirmed, walking with a coordinator, and family notified their parents arrived safely"
          fill
          priority
          unoptimized
          sizes="(min-width: 1152px) 72rem, 100vw"
          className="object-contain"
        />
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="h-full">
            <Card className="h-full">
              <CardContent>
                <span className="font-heading text-xs font-bold text-primary">STEP {i + 1}</span>
                <Icon className="mt-2 size-6 text-primary" aria-hidden="true" />
                <p className="mt-2 font-heading text-base font-bold text-foreground">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
