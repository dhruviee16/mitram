import Link from "next/link";

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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center font-heading text-xl font-bold text-primary"
        >
          Mitram
        </Link>
        <div className="mt-8">
          <h1 className="text-center font-heading text-2xl font-bold text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {showPartnerLink && (
          <p className="mt-8 border-t border-border pt-4 text-center text-sm text-muted-foreground">
            Run a travel business?{" "}
            <Link href="/vendor" className="font-medium text-primary hover:underline">
              Partner with Mitram
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
