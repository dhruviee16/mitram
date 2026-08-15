"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Destination = {
  slug: string;
  name: string;
  state: string | null;
  description: string | null;
  heroImage: string | null;
};

const BENTO_POSITION = [
  "md:col-start-1 md:row-start-1 md:row-span-2",
  "md:col-start-2 md:row-start-1",
  "md:col-start-2 md:row-start-2",
  "md:col-start-3 md:row-start-1 md:row-span-2",
  "md:col-start-4 md:row-start-1",
  "md:col-start-4 md:row-start-2",
];

export function DestinationInspiration({
  destinations,
}: {
  destinations: Destination[];
}) {
  if (destinations.length === 0) return null;

  return (
    <section className="px-4 pt-2 pb-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Where families are going this season
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:auto-rows-46">
          {destinations.map((destination, index) => {
            const isBig = index === 0 || index === 3;
            return (
              <Link
                key={destination.slug}
                href={`/destinations/${destination.slug}`}
                className={cn(
                  "group relative isolate h-42.5 overflow-hidden rounded-2xl ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-auto",
                  BENTO_POSITION[index],
                )}
              >
                {destination.heroImage ? (
                  <motion.div
                    className="absolute inset-0"
                    initial="idle"
                    whileHover="active"
                    variants={{ idle: { scale: 1 }, active: { scale: 1.06 } }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Image
                      src={destination.heroImage}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-primary to-foreground" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent to-45%" />

                <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/45 p-3.5 backdrop-blur-md">
                  {destination.state && (
                    <p className="text-[10px] font-bold tracking-wide text-white/70 uppercase">
                      {destination.state}
                    </p>
                  )}
                  <p
                    className={cn(
                      "mt-0.5 font-heading font-bold text-white",
                      isBig ? "text-lg" : "text-[15px]",
                    )}
                  >
                    {destination.name}
                  </p>
                  {isBig && destination.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-white/80">
                      {destination.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
