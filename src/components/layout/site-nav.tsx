import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/trips", label: "Yatras" },
  { href: "/trips", label: "All Packages" },
  { href: "/dashboard", label: "Live Tracker" },
];

export function SiteNav() {
  return (
    <header className="border-b border-border bg-card">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/brand/logo.png"
            alt="Mitram"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-heading text-xl font-bold text-primary">Mitram</span>
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary focus-visible:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Sign In
        </Link>
      </nav>
    </header>
  );
}
