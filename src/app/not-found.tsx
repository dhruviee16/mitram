import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-6 text-center">
      <Compass className="size-12 text-primary" aria-hidden="true" />
      <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">
        Looks like you&rsquo;ve wandered off the path
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&rsquo;t find the page you were looking for.
      </p>
      <Button className="mt-6" render={<Link href="/">Back to Mitram</Link>} />
    </div>
  );
}
