import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/trips", label: "Trips" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/users", label: "Users" },
];

export function AdminNav({ active }: { active: string }) {
  return (
    <nav aria-label="Admin" className="mb-6 flex flex-wrap gap-2 border-b border-border">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={active === link.href ? "page" : undefined}
          className={
            active === link.href
              ? "border-b-2 border-primary px-3 py-2.5 text-sm font-semibold text-primary"
              : "border-b-2 border-transparent px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
