import { Mail, Phone, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Need a Hand? | MITRAM" };

const channels = [
  { icon: Phone, label: "Call us", value: "+91 22 4896 3888" },
  { icon: Mail, label: "Email us", value: "support@mitram.example" },
  { icon: MessageCircle, label: "WhatsApp", value: "Available 9am–8pm IST" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Need a Hand?</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Our support desk is here for travellers, family members and travel partners alike.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {channels.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="text-center">
              <Icon className="mx-auto size-5 text-primary" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
