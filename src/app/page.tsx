import { Hero } from "@/components/home/hero";
import { BrowseCategories } from "@/components/home/browse-categories";
import { TripCarousel } from "@/components/home/trip-carousel";
import { HowItWorks } from "@/components/home/how-it-works";
import { StorySections } from "@/components/home/story-sections";
import { TrustPillars } from "@/components/home/trust-pillars";
import { DestinationInspiration } from "@/components/home/destination-inspiration";
import { Testimonials } from "@/components/home/testimonials";
import { HomeCta } from "@/components/home/home-cta";
import { listTrips } from "@/server/services/tripService";
import { listCategories } from "@/server/services/categoryService";
import { listPublishedDestinations } from "@/server/services/destinationService";
import { listFeaturedTestimonials } from "@/server/services/testimonialService";
import { getHomeStats } from "@/server/services/statsService";

export default async function Home() {
  const [trips, categories, destinations, testimonials, stats] = await Promise.all([
    listTrips(),
    listCategories(),
    listPublishedDestinations(6),
    listFeaturedTestimonials(),
    getHomeStats(),
  ]);

  return (
    <>
      <Hero stats={{ averageRating: stats.averageRating, travelers: stats.travelers }} />
      <TrustPillars />
      <BrowseCategories categories={categories} />
      <TripCarousel trips={trips} />
      <HowItWorks />
      <StorySections />
      <DestinationInspiration destinations={destinations} />
      <Testimonials testimonials={testimonials} />
      <HomeCta />
    </>
  );
}
