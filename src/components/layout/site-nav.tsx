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

const tripCategories = [
  {
    href: "/trips?category=spiritual",
    label: "Spiritual Journeys",
    description: "Char Dham, Shikharji, Vaishno Devi",
  },
  {
    href: "/trips?category=heritage",
    label: "Heritage & Cultural Trails",
    description: "Dwarka, Rann of Kutch, Kashmir",
  },
  {
    href: "/trips?category=leisure",
    label: "Leisure & Fun Getaways",
    description: "Bhutan, Spain & Portugal",
  },
  {
    href: "/trips?category=nature-wildlife",
    label: "Nature & Wildlife",
    description: "Gentle-paced escapes",
  },
  {
    href: "/trips?category=festival",
    label: "Festival-Centric Trips",
    description: "Timed around your favourites",
  },
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

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
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

        {isVendor ? (
          <NavigationMenu aria-label="Main" className="hidden md:flex">
            <NavigationMenuList>
              {vendorLinks.map((link) => (
                <NavigationMenuItem key={link.label}>
                  <NavigationMenuLink render={<Link href={link.href}>{link.label}</Link>} />
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        ) : (
          <NavigationMenu aria-label="Main" className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Yatras &amp; Trips</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[520px] grid-cols-2 gap-x-7 gap-y-1 p-3">
                    {tripCategories.map((category) => (
                      <NavigationMenuLink
                        key={category.href}
                        render={<Link href={category.href} />}
                        className="flex-col items-start gap-0.5"
                      >
                        <span className="font-semibold text-foreground">{category.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {category.description}
                        </span>
                      </NavigationMenuLink>
                    ))}
                    <NavigationMenuLink render={<Link href="/trips" />}>
                      <span className="font-semibold text-primary">View all packages →</span>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link href="/dashboard">My Bookings</Link>} />
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
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/vendor"
              className="hidden text-[13px] font-medium text-muted-foreground hover:text-foreground sm:inline"
            >
              Become a partner
            </Link>
            <Button render={<Link href="/login" />}>Sign In</Button>
          </div>
        )}
      </div>
    </header>
  );
}
