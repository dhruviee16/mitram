import Link from "next/link";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
        <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-sm">
          <CardHeader className="gap-3 border-b border-border bg-secondary/40 px-5 py-5">
            <Badge variant="secondary" className="w-fit gap-1">
              <ShieldCheck className="size-3" aria-hidden="true" />
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
            <Button className="min-h-11" render={<Link href={`/book/${slug}`}>Book Now</Link>} />
          </CardHeader>

          <CardContent className="px-5 py-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Care features
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-foreground" role="list">
              {careFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <ShieldCheck
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {inclusions.length > 0 && (
              <>
                <Separator className="my-5" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Key inclusions
                </h3>
                <ul className="mt-3 space-y-2.5 text-sm text-foreground" role="list">
                  {inclusions.slice(0, 4).map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto max-w-6xl">
          <Card className="flex-row items-center gap-3 px-4 py-3 shadow-lg">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-2xl font-bold text-primary">
                ₹{basePrice.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">
                per person · {durationDays}D/{durationNights}N
              </p>
            </div>
            <Button className="min-h-11" render={<Link href={`/book/${slug}`}>Book now</Link>} />
          </Card>
        </div>
      </div>
    </>
  );
}
