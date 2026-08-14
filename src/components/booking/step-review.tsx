"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { useCreateBooking } from "@/hooks/use-create-booking";
import { useCreatePaymentOrder } from "@/hooks/use-create-payment-order";
import { useVerifyPayment } from "@/hooks/use-verify-payment";
import { useBookingDraftStore } from "@/stores/booking-draft-store";
import type { BookedFor } from "@/lib/validations/booking";
import type { TripSummary } from "@/components/booking/booking-wizard";
import { formatRoute } from "@/lib/format-route";

const bookedForLabels: Record<BookedFor, string> = {
  self: "Myself",
  parent: "My parent",
  nri: "NRI booking from abroad",
};

export function StepReview({ trip, onBack }: { trip: TripSummary; onBack: () => void }) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const draft = useBookingDraftStore((s) => s.draft);
  const resetDraft = useBookingDraftStore((s) => s.reset);

  const createBooking = useCreateBooking();
  const createPaymentOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const totalAmount = trip.basePrice * draft.travelers.length;
  const tripDate = trip.dates.find((d) => d.id === draft.tripDateId);

  async function handlePay() {
    if (!draft.bookedFor || !draft.tripDateId || !draft.roomType) return;
    setPaying(true);
    try {
      const { bookingId } = await createBooking.mutateAsync({
        tripSlug: trip.slug,
        tripDateId: draft.tripDateId,
        bookedFor: draft.bookedFor,
        travelers: draft.travelers.map((t) => ({
          name: t.name,
          age: Number(t.age),
          relationship: t.relationship,
          healthNotes: t.healthNotes,
          dietaryNeeds: t.dietaryNeeds,
        })),
        roomType: draft.roomType as "single" | "twin" | "triple",
        specialCareRequests: draft.specialCareRequests,
        emergencyContact: {
          name: draft.emergencyContactName,
          phone: draft.emergencyContactPhone,
          relation: draft.emergencyContactRelation,
        },
        familyContact: {
          link: draft.linkFamilyContact,
          name: draft.familyContactName,
          email: draft.familyContactEmail,
          phone: draft.familyContactPhone,
          relationship: draft.familyContactRelationship,
        },
        insuranceOpted: draft.insuranceOpted,
      });

      const order = await createPaymentOrder.mutateAsync(bookingId);

      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        order_id: order.orderId,
        name: "Mitram",
        description: trip.title,
        handler: async (response) => {
          try {
            await verifyPayment.mutateAsync({
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resetDraft();
            router.push(`/book/confirmation/${bookingId}`);
          } catch {
            toast.error("Payment could not be verified. Please contact support.");
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setPaying(false);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Review &amp; pay</h1>

      <div className="mt-4 flex gap-3 rounded-lg border border-border p-3">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
          <Image
            src={trip.images[0] ?? "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=200&q=70"}
            alt={trip.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{trip.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatRoute(trip.routeSummary)} · {trip.durationDays}D/{trip.durationNights}N
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Booking for</dt>
          <dd className="text-foreground">{draft.bookedFor ? bookedForLabels[draft.bookedFor] : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Departure</dt>
          <dd className="text-foreground">
            {tripDate
              ? new Date(tripDate.departureDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Travelers</dt>
          <dd className="text-right text-foreground">
            {draft.travelers.map((t) => `${t.name} (${t.age})`).join(", ")}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Room</dt>
          <dd className="text-foreground capitalize">{draft.roomType}</dd>
        </div>
        {draft.specialCareRequests.length > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Care requests</dt>
            <dd className="text-right text-foreground">{draft.specialCareRequests.join(", ")}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Emergency contact</dt>
          <dd className="text-foreground">{draft.emergencyContactName} · {draft.emergencyContactPhone}</dd>
        </div>
        {draft.linkFamilyContact && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Family contact</dt>
            <dd className="text-foreground">{draft.familyContactName}</dd>
          </div>
        )}
        {(draft.insuranceOpted || trip.insuranceIncluded) && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Insurance</dt>
            <dd className="text-foreground">{trip.insuranceIncluded ? "Included" : "Added"}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-sm font-semibold text-foreground">
          Total ({draft.travelers.length} traveler{draft.travelers.length === 1 ? "" : "s"})
        </span>
        <span className="font-heading text-2xl font-bold text-primary">
          ₹{totalAmount.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" className="flex-1 min-h-11" onClick={onBack} disabled={paying}>
          Back
        </Button>
        <Button type="button" className="flex-1 min-h-11" onClick={handlePay} disabled={paying}>
          {paying ? "Processing..." : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
        </Button>
      </div>
    </div>
  );
}
