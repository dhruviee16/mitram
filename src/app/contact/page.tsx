import Image from "next/image";
import { Mail, Phone, MessageCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Need a Hand? | MITRAM" };

const channels = [
  { icon: Phone, label: "Call us", value: "+91 22 4896 3888" },
  { icon: Mail, label: "Email us", value: "mitramtravels@gmail.com", href: "mailto:mitramtravels@gmail.com" },
  { icon: MessageCircle, label: "WhatsApp", value: "Available 9am–8pm IST" },
];

export default function ContactPage() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-background lg:min-h-[calc(100svh-8rem)] lg:justify-center">
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-8">
        <div className="relative z-10">
          <h1 className="font-heading text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl">
            Need a Hand?
          </h1>
          <p className="mt-4 max-w-md text-[15px] text-muted-foreground sm:text-base">
            Our support desk is here for travellers, family members and
            travel partners alike.
          </p>
          <div className="mt-7 grid max-w-md gap-3 sm:grid-cols-3">
            {channels.map(({ icon: Icon, label, value, href }) => (
              <Card key={label}>
                <CardContent className="text-center">
                  <Icon className="mx-auto size-5 text-primary" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="text-xs break-words text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-xs break-words text-muted-foreground">{value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-foreground">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            We typically respond within a few minutes.
          </div>
        </div>

        <div aria-hidden="true" className="hidden lg:block" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[64%] lg:block">
        <Image
          src="/images/contact/support-team.png"
          alt="Three MITRAM support team members: on a call, on a tablet, and with a Mitram tote bag"
          fill
          priority
          unoptimized
          sizes="64vw"
          className="object-contain object-bottom"
        />
      </div>
    </section>
  );
}
