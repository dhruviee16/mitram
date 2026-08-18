import Link from "next/link";
import Image from "next/image";
import { Radio } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { auth } from "@/auth";
import { listCategories } from "@/server/services/categoryService";
import { getOngoingBookingForUser } from "@/server/services/bookingService";

const customerPrimaryLinks = [{ href: "/destinations", label: "Destinations" }];

const companyLinks = [
  { href: "/about", label: "About MITRAM" },
  { href: "/how-it-works", label: "How MITRAM Works" },
  { href: "/safety", label: "Safety & Trust" },
  { href: "/vendor", label: "For Vendors" },
];

const customerMenuLinks = [
  { href: "/dashboard", label: "My Bookings" },
  { href: "/dashboard/saved", label: "Saved Trips" },
  { href: "/dashboard/family", label: "Family Connections" },
];

const vendorMenuLinks = [{ href: "/vendor/dashboard", label: "Vendor Dashboard" }];

const adminMenuLinks = [{ href: "/admin", label: "Admin" }, ...customerMenuLinks];

export async function SiteNav() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isVendor = role === "vendor";
  const isAdmin = role === "admin";
  const categories = await listCategories();

  const menuLinks = isVendor ? vendorMenuLinks : isAdmin ? adminMenuLinks : customerMenuLinks;
  const ongoingBooking = session?.user?.id
    ? await getOngoingBookingForUser(session.user.id)
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/75 backdrop-blur-md supports-backdrop-filter:bg-card/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/images/brand/logo-full.png"
            alt="Mitram: More Journeys, Together"
            width={1536}
            height={1024}
            priority
            className="h-16 w-auto"
          />
        </Link>

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
                    >
                      <span className="font-semibold text-foreground">
                        {category.name}
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
            {customerPrimaryLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink render={<Link href={link.href}>{link.label}</Link>} />
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Company</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="flex w-52 flex-col gap-0.5 p-3">
                  {companyLinks.map((link) => (
                    <NavigationMenuLink key={link.href} render={<Link href={link.href} />}>
                      <span className="font-semibold text-foreground">{link.label}</span>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {session?.user ? (
          <div className="flex items-center gap-3">
            {ongoingBooking && (
              <Link
                href={`/dashboard/bookings/${ongoingBooking.id}`}
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                <Radio className="hidden size-3.5 sm:inline" aria-hidden="true" />
                <span className="hidden sm:inline">{ongoingBooking.trip.title} is live</span>
                <span className="sm:hidden">Live</span>
              </Link>
            )}
            <UserMenu
              name={session.user.name ?? "Account"}
              email={session.user.email ?? ""}
              links={menuLinks}
            />
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
