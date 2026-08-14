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

export default async function Home() {
  const trips = await listTrips();

  return (
    <>
      <Hero />
      <DealsStrip />
      <BrowseCategories />
      <TripCarousel trips={trips} />
      <HowItWorks />
      <TrustPillars />
      <DestinationInspiration />
      <Testimonials />
      <HomeCta />
    </>
  );
}
