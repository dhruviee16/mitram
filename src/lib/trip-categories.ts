export const TRIP_CATEGORIES = [
  { value: "community", label: "Community-Based Journeys" },
  { value: "state-focused", label: "State-Focused Explorations" },
  { value: "spiritual", label: "Spiritual Journeys" },
  { value: "leisure", label: "Leisure & Fun Getaways" },
  { value: "nature-wildlife", label: "Nature & Wildlife Escapes" },
  { value: "heritage", label: "Heritage & Cultural Trails" },
  { value: "festival", label: "Festival-Centric Trips" },
] as const;

export type TripCategoryValue = (typeof TRIP_CATEGORIES)[number]["value"];
