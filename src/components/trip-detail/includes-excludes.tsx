import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function IncludesExcludes({ inclusions, exclusions }: { inclusions: string[]; exclusions: string[] }) {
  if (inclusions.length === 0 && exclusions.length === 0) return null;

  return (
    <section aria-labelledby="includes-heading">
    <Card>
    <CardContent className="grid gap-4 sm:grid-cols-2">
      {inclusions.length > 0 && (
        <div>
          <h2 id="includes-heading" className="font-heading text-lg font-bold text-foreground">
            Tour Includes
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm text-foreground" role="list">
            {inclusions.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {exclusions.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">Tour Excludes</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground" role="list">
            {exclusions.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
    </Card>
    </section>
  );
}
