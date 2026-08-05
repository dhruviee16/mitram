import Link from "next/link";

export function HomeCta() {
  return (
    <section className="px-4 py-10 text-center sm:px-6">
      <h2 className="font-heading text-xl font-bold text-foreground">
        Ready to plan their next yatra?
      </h2>
      <Link
        href="/trips"
        className="mt-4 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Explore trips
      </Link>
    </section>
  );
}
