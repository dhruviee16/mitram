import Link from "next/link";

const footerColumns = [
  {
    heading: "Trips",
    links: [
      { href: "/trips?category=spiritual", label: "Spiritual Yatras" },
      { href: "/trips?category=heritage", label: "Heritage Trails" },
      { href: "/trips?category=leisure", label: "International Leisure" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/dashboard", label: "My Bookings" },
      { href: "/vendor", label: "Contact Saathi desk" },
      { href: "/vendor", label: "Safety & medical policy" },
    ],
  },
  {
    heading: "Partner",
    links: [{ href: "/vendor", label: "List your trips on Mitram" }],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <p className="font-heading text-lg font-bold text-primary">Mitram</p>
          <p className="mt-2.5 max-w-xs text-[13px] text-muted-foreground">
            Senior-assisted travel, done right. A trust layer that makes senior travel safe for
            the traveler and visible for the family paying for it.
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
