import Link from "next/link";
import Image from "next/image";
import { Users, ShieldCheck, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustPoints = [
  { icon: Users, label: "Trusted by thousands of families" },
  { icon: ShieldCheck, label: "Senior-friendly travel focus" },
  { icon: IndianRupee, label: "Grow your business with Mitram" },
];

export default function VendorLandingPage() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-background lg:min-h-[calc(100svh-8rem)] lg:justify-center">
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pt-12 pb-12 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-8 lg:pb-0">
        <div className="relative z-10">
          <h1 className="font-heading text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl lg:text-6xl">
            List your trips on Mitram
          </h1>
          <p className="mt-4 max-w-md text-[15px] text-muted-foreground sm:text-base">
            Reach families booking safe, senior-friendly travel. Manage your
            trips, bookings, and live updates in one place.
          </p>
          <div className="mt-7 flex gap-3">
            <Button
              size="lg"
              render={<Link href="/vendor/signup">Become a partner</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/vendor/login">Vendor sign in</Link>}
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="max-w-32 text-sm text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div aria-hidden="true" className="hidden lg:block" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] lg:block">
        <Image
          src="/images/vendor/hero-partner.png"
          alt="A Mitram travel partner holding a tablet and a curated-journeys brochure"
          fill
          priority
          unoptimized
          sizes="62vw"
          className="object-contain object-bottom"
        />
      </div>
    </section>
  );
}
