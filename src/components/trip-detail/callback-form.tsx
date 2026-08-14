"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// UI-only lead capture — no lead/CRM backend exists yet. Wire to a real
// endpoint (e.g. SupportTicket or a dedicated Lead model) when that lands.
export function CallbackForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-heading text-base font-bold text-foreground">Want us to call you?</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Request a callback from our team for more details about this trip.
      </p>
      {submitted ? (
        <p className="mt-4 text-sm font-semibold text-primary">
          Thanks — a MITRAM expert will call you shortly.
        </p>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            toast.success("Callback request received.");
          }}
        >
          <div>
            <label htmlFor="callback-name" className="sr-only">Name</label>
            <input
              id="callback-name"
              required
              placeholder="Your name"
              className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div>
            <label htmlFor="callback-phone" className="sr-only">Phone number</label>
            <input
              id="callback-phone"
              type="tel"
              required
              placeholder="Phone number"
              className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Button type="submit" className="w-full min-h-11">
            Request a call back
          </Button>
        </form>
      )}
    </div>
  );
}
