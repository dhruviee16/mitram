"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type PublishedDestination = {
  slug: string;
  name: string;
  state: string | null;
  description: string | null;
  heroImage: string | null;
};

export function DestinationCard({
  destination,
  large = false,
  className,
}: {
  destination: PublishedDestination;
  large?: boolean;
  className?: string;
}) {
  const showState =
    destination.state && destination.state.trim().toLowerCase() !== destination.name.trim().toLowerCase();

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative isolate h-42.5 overflow-hidden rounded-2xl ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-auto",
        className,
      )}
    >
      <motion.div
        className="absolute inset-0"
        initial="idle"
        whileHover="active"
        variants={{ idle: { scale: 1 }, active: { scale: 1.06 } }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Image
          src={destination.heroImage!}
          alt=""
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent to-45%" />

      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/45 p-3.5 backdrop-blur-md">
        {showState && (
          <p className="text-[10px] font-bold tracking-wide text-white/70 uppercase">
            {destination.state}
          </p>
        )}
        <p
          className={cn(
            "mt-0.5 font-heading font-bold text-white",
            large ? "text-lg" : "text-[15px]",
          )}
        >
          {destination.name}
        </p>
        {destination.description && (
          <p className="mt-1 line-clamp-2 text-xs text-white/80">{destination.description}</p>
        )}
      </div>
    </Link>
  );
}
