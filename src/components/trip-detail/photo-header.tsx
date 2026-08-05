import Image from "next/image";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&q=70";

export function PhotoHeader({
  title,
  routeSummary,
  durationDays,
  durationNights,
  image,
}: {
  title: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
  image?: string;
}) {
  return (
    <div className="relative h-56 w-full overflow-hidden sm:h-72">
      <Image
        src={image ?? FALLBACK_IMAGE}
        alt={`${title} — ${routeSummary}`}
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-white/85">
          {routeSummary} · {durationDays}D/{durationNights}N
        </p>
      </div>
    </div>
  );
}
