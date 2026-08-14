import Link from "next/link";

export function TopOfferStrip() {
  return (
    <div className="bg-foreground px-4 py-2 text-center text-[13px] font-semibold tracking-wide text-background">
      Booking for your parents? Every trip below includes a verified Saathi companion and live
      family tracking —{" "}
      <Link href="/#how-it-works" className="text-accent hover:underline">
        see how it works →
      </Link>
    </div>
  );
}
