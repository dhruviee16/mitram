"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

export function SearchStrip() {
  const router = useRouter();
  const [destination, setDestination] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = destination.trim() ? `?q=${encodeURIComponent(destination.trim())}` : "";
    router.push(`/trips${params}`);
  }

  return (
    <div className="bg-primary px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-heading text-lg font-bold text-primary-foreground sm:text-xl">
          Where does your parents&rsquo; next yatra begin?
        </h1>
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 rounded-lg bg-card p-3 shadow-lg sm:flex-row sm:items-center"
        >
          <div className="flex-1 border-b border-border pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
            <label htmlFor="search-from" className="block text-[10px] font-bold uppercase text-muted-foreground">
              From
            </label>
            <input
              id="search-from"
              type="text"
              defaultValue="New Delhi"
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>
          <div className="flex-1 border-b border-border pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:px-3">
            <label htmlFor="search-to" className="block text-[10px] font-bold uppercase text-muted-foreground">
              Going to
            </label>
            <input
              id="search-to"
              type="text"
              placeholder="e.g. Char Dham"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Search className="size-4" aria-hidden="true" />
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
