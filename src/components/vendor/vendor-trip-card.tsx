import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type VendorTripCardTrip = {
  id: string;
  title: string;
  category: { name: string };
  basePrice: number;
  status: string;
  _count: { bookings: number };
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  approved: "default",
  pending_approval: "secondary",
  paused: "secondary",
  rejected: "destructive",
  draft: "secondary",
};

const STATUS_LABEL: Record<string, string> = {
  approved: "Live",
  pending_approval: "Pending approval",
  paused: "Paused",
  rejected: "Rejected",
  draft: "Draft",
};

export function VendorTripCard({ trip }: { trip: VendorTripCardTrip }) {
  return (
    <Card className="flex-row items-center justify-between gap-4">
    <CardContent className="flex flex-1 items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-heading text-base font-bold text-foreground">{trip.title}</p>
          <Badge variant={STATUS_VARIANT[trip.status] ?? "secondary"}>
            {STATUS_LABEL[trip.status] ?? trip.status}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{trip.category.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {trip._count.bookings} booking{trip._count.bookings === 1 ? "" : "s"} · ₹
          {trip.basePrice.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/vendor/trips/${trip.id}/bookings`}>Bookings</Link>} />
        <Button variant="secondary" size="sm" render={<Link href={`/vendor/trips/${trip.id}/edit`}>Edit</Link>} />
      </div>
    </CardContent>
    </Card>
  );
}
