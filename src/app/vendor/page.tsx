import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function VendorLandingPage() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:pt-20">
        <div className="pb-16 lg:pb-24">
          <h1 className="font-heading text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl lg:text-6xl">
            List your trips on Mitram
          </h1>
          <p className="mt-4 max-w-md text-[15px] text-muted-foreground sm:text-base">
            Reach families booking safe, senior-friendly travel. Manage your
            trips, bookings, and live updates in one place.
          </p>
          <div className="mt-7 flex gap-3">
            <Button
              render={<Link href="/vendor/signup">Become a partner</Link>}
            />
            <Button
              variant="outline"
              render={<Link href="/vendor/login">Vendor sign in</Link>}
            />
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-lg lg:block">
          <div
            className="absolute -top-10 -left-10 -z-10 size-56 rounded-full bg-accent/30"
            aria-hidden="true"
          />
          <div
            className="absolute -right-12 bottom-1/4 -z-10 size-64 rounded-full bg-primary/15"
            aria-hidden="true"
          />
          <Image
            src="/images/vendor/hero-travelers.png"
            alt="A senior couple and their guide walking together with travel bags"
            width={1208}
            height={1302}
            priority
            className="h-auto w-full object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
