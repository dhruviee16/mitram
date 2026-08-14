import { Mail, Phone, MessageCircle } from "lucide-react";

export const metadata = { title: "Need a Hand? — MITRAM" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Need a Hand?</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Our support desk is here for travellers, family members and travel partners alike.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <Phone className="mx-auto size-5 text-primary" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-foreground">Call us</p>
          <p className="text-xs text-muted-foreground">+91 22 4896 3888</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <Mail className="mx-auto size-5 text-primary" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-foreground">Email us</p>
          <p className="text-xs text-muted-foreground">support@mitram.example</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <MessageCircle className="mx-auto size-5 text-primary" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-foreground">WhatsApp</p>
          <p className="text-xs text-muted-foreground">Available 9am–8pm IST</p>
        </div>
      </div>
    </div>
  );
}
