import { FeatureSteps } from "@/components/ui/feature-steps";

const features = [
  {
    step: "Medical support",
    title: "Medical support",
    content:
      "Trip coordinators trained for senior care, with tie-ups for on-trip medical assistance if it's ever needed.",
    image: "/images/features/medical-support.jpg",
  },
  {
    step: "Live family tracking",
    title: "Live family tracking",
    content:
      "Family back home can follow the journey in real time — every stop, every day, without having to ask.",
    image: "/images/features/live-tracking.jpg",
  },
  {
    step: "Police-verified Saathi",
    title: "Police-verified Saathi",
    content:
      "Every Saathi accompanying a group is background-checked and police-verified before they travel with you.",
    image: "/images/features/verified-saathi.jpg",
  },
  {
    step: "Senior-first pacing",
    title: "Senior-first pacing",
    content:
      "Itineraries built around comfort — fewer rushed transfers, more rest, and walking levels set for the group.",
    image: "/images/features/senior-pacing.jpg",
  },
];

export function TrustPillars() {
  return (
    <FeatureSteps
      features={features}
      title="Built for peace of mind"
      subtitle="The four things every Mitram journey is designed around."
    />
  );
}
