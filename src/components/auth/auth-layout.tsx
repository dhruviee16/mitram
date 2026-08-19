import Link from "next/link";
import Image from "next/image";

export function AuthLayout({
  title,
  subtitle,
  showPartnerLink = false,
  children,
}: {
  title: string;
  subtitle: string;
  showPartnerLink?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-background lg:min-h-[calc(100vh-4rem)]">
      <div className="relative mx-auto flex max-w-7xl flex-col px-6 py-12 lg:min-h-[calc(100vh-4rem)] lg:flex-row lg:items-center lg:gap-8">
        <div className="relative z-10 w-full max-w-sm lg:shrink-0">
          <Link href="/" className="font-heading text-xl font-bold text-primary">
            Mitram
          </Link>
          <div className="mt-6">
            <h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          {showPartnerLink && (
            <p className="mt-8 border-t border-border pt-4 text-sm text-muted-foreground">
              Run a travel business?{" "}
              <Link href="/vendor" className="font-medium text-primary hover:underline">
                Partner with Mitram
              </Link>
            </p>
          )}
        </div>

        <div aria-hidden="true" className="hidden lg:block lg:flex-1" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[45%] lg:block">
        <Image
          src="/images/auth/travelers-trio.png"
          alt="A senior couple checking a phone with their Mitram coordinator, ready to travel"
          fill
          priority
          unoptimized
          sizes="45vw"
          className="object-contain object-bottom"
        />
      </div>
    </section>
  );
}
