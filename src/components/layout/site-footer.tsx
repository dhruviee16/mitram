import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-heading text-base font-semibold text-primary">Mitram</p>
        <p className="mt-2 max-w-md">
          Senior-assisted travel, done right. A trust layer that makes
          senior travel safe for the traveler and visible for the family paying for it.
        </p>
        <Link href="/vendor" className="mt-4 inline-block font-medium text-primary hover:underline">
          List your trips on Mitram — Become a partner
        </Link>
      </div>
    </footer>
  );
}
