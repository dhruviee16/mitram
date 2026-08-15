import Image from "next/image";
import { CameraIcon, ChevronRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatRoute } from "@/lib/format-route";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&q=70";

function HeaderCaption({
  title,
  routeSummary,
  durationDays,
  durationNights,
}: {
  title: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
      <Badge className="bg-white/90 text-foreground hover:bg-white">
        {durationDays}D/{durationNights}N
      </Badge>
      <h1 className="mt-3 font-heading text-2xl font-bold text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-1 text-sm text-white/85 sm:text-base">{formatRoute(routeSummary)}</p>
    </div>
  );
}

export function PhotoHeader({
  title,
  routeSummary,
  durationDays,
  durationNights,
  category,
  images,
}: {
  title: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
  category: string;
  images: string[];
}) {
  const heroImage = images[0] ?? FALLBACK_IMAGE;
  const secondaryImages = images.slice(1, 5);
  const hasGallery = secondaryImages.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>All Packages</span>
        <ChevronRightIcon className="size-3" aria-hidden="true" />
        <Badge variant="secondary" className="capitalize">
          {category}
        </Badge>
      </div>

      {!hasGallery ? (
        <div className="relative h-56 w-full overflow-hidden rounded-[1.25rem] sm:h-80">
          <Image
            src={heroImage}
            alt={`${title} — ${formatRoute(routeSummary)}`}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
          <HeaderCaption
            title={title}
            routeSummary={routeSummary}
            durationDays={durationDays}
            durationNights={durationNights}
          />
        </div>
      ) : (
        <Dialog>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] sm:gap-1">
            <DialogTrigger className="group relative h-56 overflow-hidden rounded-[1.25rem] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-80">
              <Image
                src={heroImage}
                alt={`${title} — ${formatRoute(routeSummary)}`}
                fill
                sizes="(min-width: 640px) 60vw, 100vw"
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
              <HeaderCaption
                title={title}
                routeSummary={routeSummary}
                durationDays={durationDays}
                durationNights={durationNights}
              />
              <span className="absolute right-4 top-4 hidden items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground sm:inline-flex">
                <CameraIcon className="size-3.5" aria-hidden="true" />
                View Gallery
              </span>
            </DialogTrigger>

            <div className="grid h-56 grid-cols-2 grid-rows-2 gap-2 sm:h-80 sm:gap-1">
              {secondaryImages.map((img, i) => (
                <div
                  key={img}
                  className="relative overflow-hidden rounded-xl sm:rounded-lg"
                >
                  <Image
                    src={img}
                    alt={`${title} — additional photo ${i + 1}`}
                    fill
                    sizes="(min-width: 640px) 25vw, 45vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogContent className="max-h-[90vh] w-[min(92vw,56rem)] max-w-none p-0 sm:max-w-none">
            <DialogHeader className="px-5 pt-5">
              <DialogTitle className="text-left text-xl">
                Trip gallery
              </DialogTitle>
              <DialogDescription className="text-left">
                Real photos from this route.
              </DialogDescription>
            </DialogHeader>
            <div className="px-5 pb-5">
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((img, i) => (
                    <CarouselItem key={img}>
                      <div className="relative flex h-[60vh] w-full items-center justify-center overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={img}
                          alt={`${title} gallery photo ${i + 1}`}
                          fill
                          sizes="(min-width: 768px) 56rem, 92vw"
                          className="object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
