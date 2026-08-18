import { ShieldCheck, Users, Radio, Heart, Accessibility, FileCheck, BookUser, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Safety & Trust | MITRAM" };

const sections = [
  { icon: ShieldCheck, title: "Verified partners", body: "Every vendor on MITRAM goes through identity, business, experience and safety verification before their trips go live." },
  { icon: Users, title: "Coordinator support", body: "A dedicated MITRAM coordinator accompanies every group trip, a familiar face for check-ins, transfers and daily coordination." },
  { icon: Radio, title: "Emergency assistance", body: "An emergency escalation plan is in place on every trip, with a named contact and clear escalation path." },
  { icon: Heart, title: "Family updates", body: "With consent, family members can see trip status, photos and live location. Visible by default, always adjustable." },
  { icon: Accessibility, title: "Mobility support", body: "Walking intensity, accessibility notes and wheelchair availability are shown on every trip before booking." },
  { icon: FileCheck, title: "Insurance", body: "Travel insurance availability is shown clearly per trip, never claimed unless actually included." },
  { icon: BookUser, title: "Traveller guidelines", body: "Every booking includes clear guidance on what to expect, what's included, and how to reach support." },
  { icon: Lock, title: "Privacy", body: "Health and personal information is only shared with your explicit consent, and never exposed to unrelated parties." },
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Safety &amp; Trust</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Wellness assistance is operational support and does not replace professional
        medical care. Here&rsquo;s exactly what MITRAM does to keep every journey safe.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardContent>
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-2 font-heading text-sm font-bold text-foreground">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
