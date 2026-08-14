import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VendorLandingPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        List your trips on Mitram
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Reach families booking safe, senior-friendly travel — manage your trips,
        bookings, and live updates in one place.
      </p>
      <div className="mt-6 flex gap-3">
        <Button render={<Link href="/vendor/signup">Become a partner</Link>} />
        <Button variant="outline" render={<Link href="/vendor/login">Vendor sign in</Link>} />
      </div>
    </div>
  );
}
