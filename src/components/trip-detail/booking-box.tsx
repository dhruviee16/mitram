import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function BookingBox({
  slug,
  basePrice,
  durationDays,
  durationNights,
  inclusions,
  careFeatures,
}: {
  slug: string;
  basePrice: number;
  durationDays: number;
  durationNights: number;
  inclusions: string[];
  careFeatures: string[];
}) {
  return (
    <>
      <aside className="hidden lg:sticky lg:top-24 lg:block">
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="gap-3 border-b border-border px-5 py-4">
            <Badge variant="secondary" className="w-fit">
              Assisted departure
            </Badge>
            <div>
              <p className="font-heading text-3xl font-bold text-primary">
                ₹{basePrice.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-muted-foreground">
                per person · {durationDays}D/{durationNights}N
              </p>
            </div>
            <Link
              href={`/book/${slug}`}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Book Now
            </Link>
          </CardHeader>

          <CardContent className="space-y-4 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Care features</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground" role="list">
                {careFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-lg border border-border/70 bg-secondary/30 px-3 py-2 text-foreground"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {inclusions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Key inclusions</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground" role="list">
                  {inclusions.slice(0, 4).map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-border/70 bg-secondary/30 px-3 py-2 text-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-2xl font-bold text-primary">
                ₹{basePrice.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">
                per person · {durationDays}D/{durationNights}N
              </p>
            </div>
            <Link
              href={`/book/${slug}`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Book now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
