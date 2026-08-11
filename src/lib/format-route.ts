export function formatRoute(routeSummary: string) {
  return routeSummary
    .split(/→|,/)
    .map((stop) => stop.trim())
    .filter(Boolean)
    .join(" → ");
}
