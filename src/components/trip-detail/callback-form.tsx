"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";

// UI-only lead capture — no lead/CRM backend exists yet. Wire to a real
// endpoint (e.g. SupportTicket or a dedicated Lead model) when that lands.
export function CallbackForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Card>
      <CardContent>
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
            <Field>
              <FieldLabel htmlFor="callback-name" className="sr-only">Name</FieldLabel>
              <Input id="callback-name" required placeholder="Your name" className="h-11" />
            </Field>
            <Field>
              <FieldLabel htmlFor="callback-phone" className="sr-only">Phone number</FieldLabel>
              <Input id="callback-phone" type="tel" required placeholder="Phone number" className="h-11" />
            </Field>
            <Button type="submit" className="w-full min-h-11">
              Request a call back
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
