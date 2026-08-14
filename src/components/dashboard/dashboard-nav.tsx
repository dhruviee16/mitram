import Link from "next/link";

const links = [
  { href: "/dashboard", label: "My Trips" },
  { href: "/dashboard/saved", label: "Saved Trips" },
  { href: "/dashboard/family", label: "Family Connections" },
];

export function DashboardNav({ active }: { active: string }) {
  return (
    <nav aria-label="Dashboard" className="mb-6 flex gap-2 border-b border-border">
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
