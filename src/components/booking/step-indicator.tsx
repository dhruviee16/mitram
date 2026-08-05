const steps = ["Who's this for", "Traveler", "Room & care", "Review"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-6">
      <p className="sr-only" aria-live="polite">
        Step {current + 1} of {steps.length}: {steps[current]}
      </p>
      <ol className="flex items-center gap-2" aria-hidden="true">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={i === current ? "step" : undefined}
              className={
                i <= current
                  ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                  : "flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground"
              }
            >
              {i + 1}
            </span>
            <span
              className={
                i === current
                  ? "hidden text-xs font-semibold text-foreground sm:inline"
                  : "hidden text-xs text-muted-foreground sm:inline"
              }
            >
              {label}
            </span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>
    </div>
  );
}
