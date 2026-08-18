// Dummy launch reviews, all posted under the MITRAM admin account
// (SEED_ADMIN_EMAIL) so there's real-looking social proof on trip pages
// before genuine traveler reviews come in. Photos reuse each trip's own
// gallery images where available.
export const reviews: Record<
  string,
  { rating: number; comment: string; images?: string[]; daysAgo: number }[]
> = {
  "sammed-shikharji-yatra": [
    {
      rating: 5,
      comment:
        "My father completed all 9 Tonks with the Saathi's help. The palanquin option meant he never felt pushed to keep up, and the daily BP checks put our whole family at ease.",
      images: ["https://pub-e2dcf0df0eed403bb4516ca57564bed7.r2.dev/seed/trips/sammed-shikharji-yatra.jpg"],
      daysAgo: 12,
    },
    {
      rating: 4,
      comment: "Well organized and the Jain meals were authentic. Would have liked a bit more rest time on day 2.",
      daysAgo: 34,
    },
  ],
  "dwarka-rann-of-kutch": [
    {
      rating: 5,
      comment:
        "Seven days without a single rushed moment. The wheelchair access at White Rann meant my mother-in-law could watch the sunset up close, something we never thought possible.",
      images: [
        "https://pub-e2dcf0df0eed403bb4516ca57564bed7.r2.dev/seed/trips/dwarka-rann-of-kutch-1.jpg",
        "https://pub-e2dcf0df0eed403bb4516ca57564bed7.r2.dev/seed/trips/dwarka-rann-of-kutch-3.jpg",
      ],
      daysAgo: 8,
    },
    {
      rating: 5,
      comment: "The Adani Port day being fully bus-based was a nice touch, no walking required and still felt included.",
      images: ["https://pub-e2dcf0df0eed403bb4516ca57564bed7.r2.dev/seed/trips/dwarka-rann-of-kutch-2.jpg"],
      daysAgo: 21,
    },
  ],
  "char-dham-yatra": [
    {
      rating: 5,
      comment:
        "Eleven days, four dhams, and a coordinator who tracked my parents' vitals every single day. Kedarnath is tough on anyone, but the porter support carried them through it.",
      images: ["https://pub-e2dcf0df0eed403bb4516ca57564bed7.r2.dev/seed/trips/char-dham-yatra-1.jpg"],
      daysAgo: 5,
    },
    {
      rating: 4,
      comment: "Long trip but paced sensibly. The 4-star hotels made a real difference after the high-altitude days.",
      daysAgo: 46,
    },
  ],
  "vaishno-devi-yatra": [
    {
      rating: 5,
      comment:
        "The pony and battery-car options meant my mother could choose her own pace up to Bhawan. Live GPS updates kept the rest of us calm back home.",
      daysAgo: 15,
    },
    {
      rating: 4,
      comment: "Smooth pilgrimage overall. Hotel in Katra was comfortable and close to the base camp.",
      daysAgo: 60,
    },
  ],
  "jannat-e-kashmir-vistadome": [
    {
      rating: 5,
      comment:
        "The Vistadome train ride itself was worth the trip. Slow-paced, houseboat stay was magical, and the altitude support was reassuring for a first Kashmir visit at this age.",
      daysAgo: 3,
    },
    {
      rating: 5,
      comment: "Dal Lake mornings on the houseboat are something my parents still talk about.",
      daysAgo: 27,
    },
  ],
  "maharashtra-jyotirlinga-circuit": [
    {
      rating: 5,
      comment:
        "Four Jyotirlingas and Shirdi in one trip, no overnight drives, and a coordinator for every 8 travelers. Exactly the pace my in-laws needed.",
      images: ["https://pub-e2dcf0df0eed403bb4516ca57564bed7.r2.dev/seed/trips/maharashtra-jyotirlinga-circuit.jpg"],
      daysAgo: 18,
    },
    {
      rating: 4,
      comment: "Bhimashankar's forest setting was beautiful. Only wish there were more prepaid dinners included.",
      daysAgo: 40,
    },
  ],
};
