import { Hero } from "@/components/home/hero";
import { DealsStrip } from "@/components/home/deals-strip";
import { BrowseCategories } from "@/components/home/browse-categories";
import { TripCarousel } from "@/components/home/trip-carousel";
import { HowItWorks } from "@/components/home/how-it-works";
import { TrustPillars } from "@/components/home/trust-pillars";
import { DestinationInspiration } from "@/components/home/destination-inspiration";
import { Testimonials } from "@/components/home/testimonials";
import { HomeCta } from "@/components/home/home-cta";
import { listTrips } from "@/server/services/tripService";
import { listCategories } from "@/server/services/categoryService";
import { listDestinations } from "@/server/services/destinationService";
import { listFeaturedTestimonials } from "@/server/services/testimonialService";

export default async function Home() {
  const [trips, categories, destinations, testimonials] = await Promise.all([
    listTrips(),
    listCategories(),
    listDestinations(),
    listFeaturedTestimonials(),
  ]);

  return (
    <>
      <Hero />
      <DealsStrip />
      <BrowseCategories categories={categories} />
      <TripCarousel trips={trips} />
      <HowItWorks />
      <TrustPillars />
      <DestinationInspiration destinations={destinations} />
      <Testimonials testimonials={testimonials} />
      <HomeCta />
    </>
  );
}
