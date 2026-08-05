"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-6 text-center">
      <AlertTriangle className="size-12 text-primary" aria-hidden="true" />
      <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We hit a snag loading this page. Please try again.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
        <Button render={<Link href="/">Back to Mitram</Link>} />
      </div>
    </div>
  );
}
