"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import { MapPin, HeartPulse, Expand } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface RouteUpdate {
  id: string;
  locationLabel: string;
  timestamp: string | Date;
  note: string | null;
  photoUrls: string[];
  healthBp: string | null;
  healthSugar: string | null;
  healthTemp: string | null;
}

export interface RouteTrailProps {
  stops: string[];
  updates: RouteUpdate[];
  className?: string;
}

type StopStatus = "visited" | "current" | "upcoming";

const ROW_HEIGHT = 140;
const X_LEFT = 250;
const X_RIGHT = 650;
const Y_START = 90;
const BOTTOM_PADDING = 200;

function stopPoint(index: number) {
  return { x: index % 2 === 0 ? X_LEFT : X_RIGHT, y: Y_START + index * ROW_HEIGHT };
}

function segmentPath(index: number) {
  const from = stopPoint(index);
  const to = stopPoint(index + 1);
  const bend = ROW_HEIGHT * 0.6;
  return `M ${from.x} ${from.y} C ${from.x} ${from.y + bend}, ${to.x} ${to.y - bend}, ${to.x} ${to.y}`;
}

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function StopMarker({ status }: { status: StopStatus }) {
  if (status === "visited") {
    return <MapPin className="mx-auto mb-3 size-6 fill-primary text-primary-foreground" aria-hidden="true" />;
  }
  if (status === "current") {
    return (
      <span className="relative mx-auto mb-3 flex size-6 items-center justify-center">
        <span className="absolute size-6 rounded-full bg-primary/30 motion-safe:animate-ping" aria-hidden="true" />
        <MapPin className="relative size-6 text-primary" aria-hidden="true" />
      </span>
    );
  }
  return <MapPin className="mx-auto mb-3 size-6 text-muted-foreground/30" aria-hidden="true" />;
}

function StopCard({
  index,
  label,
  status,
  rotate,
  updates,
}: {
  index: number;
  label: string;
  status: StopStatus;
  rotate?: string;
  updates: RouteUpdate[];
}) {
  const hasDetails = updates.length > 0;

  const cardShell = (
    <div className="relative rounded-[20px] border border-border bg-card p-2 shadow-[0px_10px_20px_0px_rgba(0,0,0,0.08)]">
      {hasDetails && (
        <span
          className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Expand className="size-3" />
        </span>
      )}
      <StopMarker status={status} />
      <div
        className={`flex h-full flex-col rounded-[13px] border p-3 ${
          status === "upcoming"
            ? "border-border bg-muted/30 opacity-60"
            : "border-primary/20 bg-primary/5"
        }`}
      >
        <span
          className={`mb-1 text-xs font-bold ${
            status === "upcoming" ? "text-muted-foreground" : "text-primary"
          }`}
        >
          STOP {index + 1}
        </span>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <span className="mt-1 text-[11px] text-muted-foreground">
          {status === "visited" && `Reached${updates.length > 1 ? ` · ${updates.length} check-ins` : ""}`}
          {status === "current" && "Currently here"}
          {status === "upcoming" && "Upcoming"}
        </span>
      </div>
    </div>
  );

  return (
    <div
      className={`relative w-full md:w-[220px] transition-transform duration-300 hover:z-30 hover:scale-105 ${rotate}`}
    >
      {hasDetails ? (
        <Dialog>
          <DialogTrigger
            className="w-full cursor-pointer text-left transition-shadow hover:shadow-[0_0_0_2px_var(--color-primary)]"
            aria-label={`View updates for ${label}`}
          >
            {cardShell}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{label}</DialogTitle>
            </DialogHeader>
            <ol className="mt-2 max-h-96 space-y-4 overflow-y-auto">
              {[...updates].reverse().map((update) => (
                <li key={update.id} className="border-l-2 border-primary/30 pl-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    {relativeTime(new Date(update.timestamp))}
                  </p>
                  {update.photoUrls.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto">
                      {update.photoUrls.map((photoUrl) => (
                        <div
                          key={photoUrl}
                          className="relative h-40 w-40 shrink-0 overflow-hidden rounded-md"
                        >
                          <Image
                            src={photoUrl}
                            alt={`Photo from ${label}`}
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {update.note && <p className="mt-2 text-muted-foreground">{update.note}</p>}
                  {(update.healthBp || update.healthSugar || update.healthTemp) && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <HeartPulse className="size-3.5 text-primary" aria-hidden="true" />
                      {[update.healthBp, update.healthSugar, update.healthTemp].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </DialogContent>
        </Dialog>
      ) : (
        cardShell
      )}
    </div>
  );
}

export function RouteTrail({ stops, updates, className }: RouteTrailProps) {
  if (stops.length === 0) return null;

  const updatesByStop = stops.map((stop) =>
    updates.filter((u) => u.locationLabel.trim().toLowerCase() === stop.trim().toLowerCase()),
  );
  const reached = updatesByStop.map((list) => list.length > 0);
  const lastReachedIndex = reached.reduce((last, isReached, index) => (isReached ? index : last), -1);

  const statuses: StopStatus[] = stops.map((_, index) => {
    if (index <= lastReachedIndex) return "visited";
    if (index === lastReachedIndex + 1) return "current";
    return "upcoming";
  });

  const height = Y_START + (stops.length - 1) * ROW_HEIGHT + BOTTOM_PADDING;

  const segments = stops.slice(0, -1).map((_, index) => {
    // A segment's state follows the stop it arrives at: reached destination means
    // this leg is done, "current" destination means it's the leg being travelled now.
    const destinationStatus = statuses[index + 1];
    const state: "visited" | "active" | "upcoming" =
      destinationStatus === "visited" ? "visited" : destinationStatus === "current" ? "active" : "upcoming";
    return { d: segmentPath(index), state };
  });

  // Many-stop routes scroll inside a capped viewport instead of stretching the page.
  const scrollCapped = stops.length > 4;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={`relative px-4 py-6 sm:px-6 ${scrollCapped ? "max-h-[560px] overflow-y-auto" : ""} ${className ?? ""}`}
      >
        <div
          className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 md:block md:h-(--trail-height)"
          style={{ "--trail-height": `${height}px` } as React.CSSProperties}
        >
          {segments.length > 0 && (
            <svg
              className="pointer-events-none absolute top-0 left-0 z-0 hidden h-full w-full md:block"
              viewBox={`0 0 900 ${height}`}
              preserveAspectRatio="none"
            >
              {segments.map((segment, index) => {
                if (segment.state === "visited") {
                  return (
                    <path
                      key={index}
                      d={segment.d}
                      stroke="currentColor"
                      className="text-primary"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
                if (segment.state === "active") {
                  return (
                    <m.path
                      key={index}
                      d={segment.d}
                      stroke="currentColor"
                      className="text-primary"
                      strokeWidth="3"
                      strokeDasharray="8 6"
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -140 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  );
                }
                return (
                  <path
                    key={index}
                    d={segment.d}
                    stroke="currentColor"
                    className="text-border"
                    strokeWidth="1.5"
                    strokeDasharray="4 5"
                    fill="none"
                    strokeLinecap="round"
                    strokeOpacity="0.6"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          )}

          {stops.map((stop, index) => {
            const point = stopPoint(index);
            const rotate = index % 2 === 0 ? "rotate-6" : "-rotate-6";
            return (
              <div
                key={stop}
                className={index % 2 === 0 ? "md:absolute md:left-[10%]" : "md:absolute md:right-[10%]"}
                style={{ top: `${point.y - 40}px` } as React.CSSProperties}
              >
                <StopCard
                  index={index}
                  label={stop}
                  status={statuses[index]}
                  rotate={rotate}
                  updates={updatesByStop[index]}
                />
              </div>
            );
          })}
        </div>
      </div>
    </LazyMotion>
  );
}
