export function parseRouteStops(routeSummary: string) {
  return routeSummary
    .split(/→|,/)
    .map((stop) => stop.trim())
    .filter(Boolean);
}

export function formatRoute(routeSummary: string) {
  return parseRouteStops(routeSummary).join(" → ");
}
