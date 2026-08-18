import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/server/services/categoryService";
import { searchTrips } from "@/server/services/tripService";
import { TripCard } from "@/components/trip/trip-card";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const trips = await searchTrips({ category: slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">{category.name}</h1>
      {category.description && (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{category.description}</p>
      )}

      <h2 className="mt-8 font-heading text-lg font-bold text-foreground">
        {trips.length} trip{trips.length === 1 ? "" : "s"}
      </h2>
      {trips.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No trips in this category yet. Check back soon.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {trips.map((trip) => (
            <li key={trip.slug}>
              <TripCard trip={trip} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
