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
import { UserMenu } from "@/components/layout/user-menu";
import { auth } from "@/auth";
import { listCategories } from "@/server/services/categoryService";

const vendorPrimaryLinks = [
  { href: "/", label: "Home" },
  { href: "/trips", label: "All Packages" },
];

const customerPrimaryLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/how-it-works", label: "How MITRAM Works" },
];

const customerMenuLinks = [
  { href: "/dashboard", label: "My Bookings" },
  { href: "/dashboard/saved", label: "Saved Trips" },
  { href: "/dashboard/family", label: "Family Connections" },
];

const vendorMenuLinks = [{ href: "/vendor/dashboard", label: "Vendor Dashboard" }];

const adminMenuLinks = [{ href: "/admin", label: "Admin" }];

export async function SiteNav() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isVendor = role === "vendor";
  const isAdmin = role === "admin";
  const categories = isVendor ? [] : await listCategories();

  const menuLinks = isVendor ? vendorMenuLinks : isAdmin ? adminMenuLinks : customerMenuLinks;

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/75 backdrop-blur-md supports-backdrop-filter:bg-card/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
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
              {vendorPrimaryLinks.map((link) => (
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
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {session?.user ? (
          <UserMenu
            name={session.user.name ?? "Account"}
            email={session.user.email ?? ""}
            links={menuLinks}
          />
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
