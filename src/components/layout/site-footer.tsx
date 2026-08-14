import Link from "next/link";
import { listCategories } from "@/server/services/categoryService";

export async function SiteFooter() {
  const categories = await listCategories();

  const footerColumns = [
    {
      heading: "Explore",
      links: [
        { href: "/trips", label: "All Trips" },
        { href: "/destinations", label: "Destinations" },
        { href: "/categories", label: "Categories" },
        ...categories.slice(0, 3).map((c) => ({ href: `/trips?category=${c.slug}`, label: c.name })),
      ],
    },
    {
      heading: "Company",
      links: [
        { href: "/about", label: "About MITRAM" },
        { href: "/how-it-works", label: "How MITRAM Works" },
        { href: "/safety", label: "Safety & Trust" },
        { href: "/vendor", label: "For Vendors" },
      ],
    },
    {
      heading: "Support",
      links: [
        { href: "/contact", label: "Need a Hand?" },
        { href: "/faq", label: "FAQ" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <p className="font-heading text-lg font-bold text-primary">Mitram</p>
          <p className="mt-2.5 max-w-xs text-[13px] text-muted-foreground">
            More Journeys, Together. Senior-friendly group travel — comfortable, safe and
            social — with peace of mind for the family back home.
          </p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.heading}>
            <p className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
              {column.heading}
            </p>
            <div className="flex flex-col gap-2 text-[13px]">
              {column.links.map((link) => (
                <Link key={link.label} href={link.href} className="text-muted-foreground hover:text-primary">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © 2026 Mitram. All rights reserved.
      </div>
    </footer>
  );
}
