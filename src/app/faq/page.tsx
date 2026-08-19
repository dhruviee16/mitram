import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = { title: "FAQ | MITRAM" };

const faqs = [
  { q: "Who are MITRAM trips designed for?", a: "Indian travellers aged 40+ who want to travel comfortably, with a slower pace, verified support and companionship, often alongside people of a similar age group." },
  { q: "Is there always a coordinator on the trip?", a: "Every MITRAM group trip has a dedicated coordinator accompanying the group for check-ins, transfers and daily coordination." },
  { q: "Can my family see where I am during the trip?", a: "Yes, if you enable tracking visibility for a linked family connection. You control exactly what is shared and can turn it off at any time." },
  { q: "What if I need medical assistance during the trip?", a: "Wellness support (where available) includes vitals checks and an emergency escalation plan. This is operational support, not a substitute for professional medical care." },
  { q: "Is travel insurance included?", a: "This depends on the specific trip. Each trip page clearly states whether insurance is included or available as an add-on." },
  { q: "How do I become a MITRAM travel partner?", a: "Apply via the vendor registration page. Every partner goes through identity, business, experience and safety verification before trips go live." },
];

export default function FaqPage() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-background lg:min-h-[calc(100svh-8rem)] lg:justify-center">
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8">
        <div className="relative z-10">
          <span className="font-heading text-xs font-bold tracking-wide text-primary uppercase">
            FAQ
          </span>
          <h1 className="mt-2 font-heading text-3xl leading-[1.1] font-extrabold text-foreground sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 max-w-md text-[15px] text-muted-foreground sm:text-base">
            Everything you need to know before your next journey with Mitram.
          </p>

          <Accordion className="mt-7 gap-3" multiple>
            {faqs.map(({ q, a }) => (
              <AccordionItem
                key={q}
                value={q}
                className="rounded-xl border-b-0 bg-card px-4 ring-1 ring-foreground/10"
              >
                <AccordionTrigger className="font-heading text-sm font-bold text-foreground hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div aria-hidden="true" className="hidden lg:block" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] lg:block">
        <Image
          src="/images/faq/support-question.png"
          alt="A Mitram support team member with her phone, a speech bubble reading Got a question? We're here to help"
          fill
          priority
          unoptimized
          sizes="38vw"
          className="object-contain object-bottom"
        />
      </div>
    </section>
  );
}
