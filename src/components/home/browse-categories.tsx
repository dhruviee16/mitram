"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Landmark,
  Mountain,
  Globe,
  PartyPopper,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MasonryGrid } from "@/components/ui/masonry-grid";

const ICONS: Record<string, LucideIcon> = {
  spiritual: Flame,
  heritage: Landmark,
  "nature-wildlife": Mountain,
  leisure: Globe,
  festival: PartyPopper,
  "state-focused": MapPin,
  community: Users,
};

const IMAGES: Record<string, string> = {
  spiritual: "/images/categories/spiritual.png",
  heritage: "/images/categories/heritage.png",
  "nature-wildlife": "/images/categories/nature-wildlife.png",
  leisure: "/images/categories/leisure.png",
  festival: "/images/categories/festival.png",
  "state-focused": "/images/categories/state-focused.png",
  community: "/images/categories/community.png",
};

const ASPECT: Record<string, string> = {
  spiritual: "aspect-[4/5]",
  heritage: "aspect-[3/4]",
  "nature-wildlife": "aspect-square",
  leisure: "aspect-[4/5]",
  festival: "aspect-[3/4]",
  "state-focused": "aspect-square",
  community: "aspect-[4/5]",
};

type Category = {
  slug: string;
  name: string;
};

function getColumns(width: number) {
  if (width < 640) return 2;
  if (width < 1024) return 3;
  return 4;
}

export function BrowseCategories({ categories }: { categories: Category[] }) {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const handleResize = () => setColumns(getColumns(window.innerWidth));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="px-4 pt-10 pb-2 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Find your kind of journey
          </h2>
          <Link
            href="/trips"
            className="flex shrink-0 items-center gap-1 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <MasonryGrid columns={columns} gap={4} className="mt-5">
          {categories.map(({ slug, name }) => {
            const Icon = ICONS[slug] ?? Globe;
            const image = IMAGES[slug];
            return (
              <Link
                key={slug}
                href={`/trips?category=${slug}`}
                className={`group relative block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${ASPECT[slug] ?? "aspect-4/5"}`}
              >
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                    className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-primary to-foreground" />
                )}
                <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/10 to-transparent" />
                <div className="absolute top-0 left-0 flex items-center gap-2 p-3.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                    <Icon className="size-4 text-white" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-[13px] font-bold text-white drop-shadow-sm">
                    {name}
                  </span>
                </div>
              </Link>
            );
          })}
        </MasonryGrid>
      </div>
    </section>
  );
}
