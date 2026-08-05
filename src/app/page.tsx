import { SearchStrip } from "@/components/home/search-strip";
import { Hero } from "@/components/home/hero";
import { TripCarousel } from "@/components/home/trip-carousel";
import { TrustPillars } from "@/components/home/trust-pillars";
import { Testimonials } from "@/components/home/testimonials";
import { HomeCta } from "@/components/home/home-cta";
import { listTrips } from "@/server/services/tripService";

export default async function Home() {
  const trips = await listTrips();

  return (
    <>
      <SearchStrip />
      <Hero />
      <TripCarousel trips={trips} />
      <TrustPillars />
      <Testimonials />
      <HomeCta />
    </>
  );
}
