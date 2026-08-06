import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/auth";

const travelerLinks = [
  { href: "/trips", label: "Yatras" },
  { href: "/trips", label: "All Packages" },
  { href: "/dashboard", label: "My Bookings" },
];

const vendorLinks = [
  { href: "/", label: "Home" },
  { href: "/trips", label: "All Packages" },
  { href: "/vendor/dashboard", label: "My Trips" },
];

export async function SiteNav() {
  const session = await auth();
  const isVendor =
    (session?.user as { role?: string } | undefined)?.role === "vendor";
  const links = isVendor ? vendorLinks : travelerLinks;

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
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

        <NavigationMenu aria-label="Main" className="hidden md:flex">
          <NavigationMenuList>
            {links.map((link) => (
              <NavigationMenuItem key={link.label}>
                <NavigationMenuLink render={<Link href={link.href}>{link.label}</Link>} />
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {session?.user ? (
          <div className="flex items-center gap-3">
            {isVendor && (
              <Link
                href="/vendor/dashboard"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Vendor Dashboard
              </Link>
            )}
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
