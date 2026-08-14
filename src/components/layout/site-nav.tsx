import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/auth";
import { listCategories } from "@/server/services/categoryService";

const vendorLinks = [
  { href: "/", label: "Home" },
  { href: "/trips", label: "All Packages" },
  { href: "/vendor/dashboard", label: "My Trips" },
];

const primaryLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/how-it-works", label: "How MITRAM Works" },
  { href: "/vendor", label: "For Vendors" },
  { href: "/about", label: "About Us" },
];

export async function SiteNav() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isVendor = role === "vendor";
  const isAdmin = role === "admin";
  const categories = isVendor || isAdmin ? [] : await listCategories();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/brand/logo-full.png"
            alt="Mitram — More Journeys, Together"
            width={1536}
            height={1024}
            priority
            className="h-16 w-auto"
          />
        </Link>

        {isVendor ? (
          <NavigationMenu aria-label="Main" className="hidden md:flex">
            <NavigationMenuList>
              {vendorLinks.map((link) => (
                <NavigationMenuItem key={link.label}>
                  <NavigationMenuLink
                    render={<Link href={link.href}>{link.label}</Link>}
                  />
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        ) : (
          <NavigationMenu aria-label="Main" className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  Explore Trips
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-130 grid-cols-2 gap-x-7 gap-y-1 p-3">
                    {categories.map((category) => (
                      <NavigationMenuLink
                        key={category.slug}
                        render={<Link href={`/trips?category=${category.slug}`} />}
                        className="flex-col items-start gap-0.5"
                      >
                        <span className="font-semibold text-foreground">
                          {category.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {category._count.trips} trip{category._count.trips === 1 ? "" : "s"}
                        </span>
                      </NavigationMenuLink>
                    ))}
                    <NavigationMenuLink render={<Link href="/trips" />}>
                      <span className="font-semibold text-primary">
                        View all packages →
                      </span>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {primaryLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink render={<Link href={link.href}>{link.label}</Link>} />
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<Link href="/dashboard">My Bookings</Link>}
                />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}

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
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Admin
              </Link>
            )}
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="hidden text-[13px] font-medium text-muted-foreground hover:text-foreground sm:inline"
            >
              Help
            </Link>
            <Link
              href="/vendor"
              className="hidden text-[13px] font-medium text-muted-foreground hover:text-foreground sm:inline"
            >
              Become a partner
            </Link>
            <Button render={<Link href="/customer/login" />}>Sign In</Button>
          </div>
        )}
      </div>
    </header>
  );
}
