import Link from "next/link";
import { listCategories } from "@/server/services/categoryService";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Categories — MITRAM" };

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Find your kind of journey</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Card className="border-border transition-colors group-hover:border-primary">
              <CardContent>
                <p className="font-heading text-lg font-bold text-foreground">{c.name}</p>
                {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                <p className="mt-2 text-xs font-semibold text-primary">
                  {c._count.trips} trip{c._count.trips === 1 ? "" : "s"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
