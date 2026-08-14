"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Feature {
  step: string;
  title: string;
  content: string;
  image?: string;
}

interface FeatureStepsProps {
  features: Feature[];
  className?: string;
  title?: string;
  subtitle?: string;
  autoPlayInterval?: number;
}

export function FeatureSteps({
  features,
  className,
  title = "How to get started",
  subtitle,
  autoPlayInterval = 4000,
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || paused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (autoPlayInterval / 100);
        if (next < 100) return next;
        setCurrentFeature((f) => (f + 1) % features.length);
        return 0;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [features.length, autoPlayInterval, paused]);

  return (
    <section
      className={cn("px-4 py-12 sm:px-6", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-12 md:items-center">
          <div className="space-y-8 md:order-1">
            {features.map((feature, index) => (
              <button
                key={feature.step}
                type="button"
                onClick={() => {
                  setCurrentFeature(index);
                  setProgress(0);
                }}
                className="flex w-full items-start gap-4 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-heading font-bold transition-colors",
                    index === currentFeature
                      ? "border-primary bg-primary text-primary-foreground"
                      : index < currentFeature
                        ? "border-primary bg-secondary text-primary"
                        : "border-border bg-secondary text-muted-foreground",
                  )}
                >
                  {index < currentFeature ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="flex-1">
                  <span
                    className={cn(
                      "block text-[15px] font-bold transition-colors",
                      index === currentFeature ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {feature.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {feature.content}
                  </span>
                  {index === currentFeature && (
                    <span className="mt-2 block h-0.5 w-full overflow-hidden rounded-full bg-border">
                      <span
                        className="block h-full bg-primary transition-[width] duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="relative h-52 overflow-hidden rounded-2xl sm:h-72 md:order-2 md:h-96">
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={feature.step}
                      className="absolute inset-0"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -24 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      {feature.image ? (
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          sizes="(min-width: 768px) 40vw, 90vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-linear-to-br from-primary to-foreground">
                          <span className="font-heading text-sm font-semibold text-primary-foreground/60">
                            Image coming soon
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
