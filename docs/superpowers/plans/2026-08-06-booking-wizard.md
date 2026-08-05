# MITRAM Booking Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/book/[tripSlug]` — the 5-step dual-buyer booking wizard ending in a real Razorpay test-mode payment — plus a standalone `/book/confirmation/[bookingId]` page.

**Architecture:** One client component (`BookingWizard`) holds all in-progress wizard state; nothing touches the database until the final "Pay" action, which calls `POST /api/bookings` (creates `TravelerProfile` + `Booking`, both `pending`), then `POST /api/payments/create-order` (Razorpay order), then — after the Razorpay Checkout popup succeeds — `POST /api/payments/verify` (server-side HMAC signature check, the only thing allowed to mark a payment `paid`).

**Tech Stack:** Next.js App Router, react-hook-form + zod per step, official `razorpay` npm package, Razorpay Checkout.js (loaded client-side), existing `Form`/`Button`/`Input`/`Card`/`Badge` shadcn primitives, `sonner` for error feedback.

This plan corresponds to spec: `docs/superpowers/specs/2026-08-06-booking-wizard-design.md`.

## Global Constraints

- `/book/*` is already session-gated by `src/proxy.ts` — no new auth wiring needed, but every new API route must still independently call `auth()` and reject with 401 if there's no session (defense in depth — never assume the proxy is the only caller).
- **Never trust client-supplied price.** `POST /api/bookings` computes `totalAmount` from the trip's real `basePrice` (fetched server-side via `tripService.getTripBySlug`), ignoring anything the client might send for it.
- **Payment success is only ever set server-side**, after verifying the Razorpay signature with `key_secret`. The client's Checkout.js success callback is a trigger to call `/api/payments/verify`, never itself proof of payment.
- One `TravelerProfile` + one `Booking` per wizard run (`numTravelers: 1`), per spec — no multi-traveler UI in this plan.
- WCAG 2.1 AA: real labels, inline validation, visible focus rings, gold-contrast rule, step indicator announced via `aria-current`/visually-hidden text, not color alone.

---

### Task 1: Booking zod schemas + `bookingService.createBooking` + `POST /api/bookings`

**Files:**
- Create: `src/lib/validations/booking.ts`
- Modify: `src/server/services/bookingService.ts`
- Create: `src/app/api/bookings/route.ts`

**Interfaces:**
- Produces: `bookingRequestSchema`/`BookingRequestValues` (zod), `createBooking(userId, tripSlug, input)` in `bookingService`, `POST /api/bookings` — consumed by Task 4's review step.

- [ ] **Step 1: Write the zod schemas**

`src/lib/validations/booking.ts`:

```ts
import { z } from "zod";

export const bookedForSchema = z.enum(["self", "parent", "nri"]);

export const travelerSchema = z.object({
  name: z.string().min(1, "Enter the traveler's name."),
  age: z.coerce.number().int().min(1, "Enter a valid age.").max(120, "Enter a valid age."),
  relationship: z.string().min(1, "Enter the relationship to the booker."),
  healthNotes: z.array(z.string()).default([]),
  dietaryNeeds: z.array(z.string()).default([]),
});

export const roomTypeSchema = z.enum(["single", "twin", "triple"]);

export const roomCareSchema = z.object({
  roomType: roomTypeSchema,
  specialCareRequests: z.array(z.string()).default([]),
});

export type BookedFor = z.infer<typeof bookedForSchema>;
export type TravelerValues = z.infer<typeof travelerSchema>;
export type RoomCareValues = z.infer<typeof roomCareSchema>;

export const bookingRequestSchema = z.object({
  tripSlug: z.string().min(1),
  bookedFor: bookedForSchema,
  traveler: travelerSchema,
  roomType: roomTypeSchema,
  specialCareRequests: z.array(z.string()).default([]),
});

export type BookingRequestValues = z.infer<typeof bookingRequestSchema>;
```

- [ ] **Step 2: Add `createBooking` to the booking service**

Append to `src/server/services/bookingService.ts` (keep the existing `listBookingsForUser`/`getBookingById` untouched):

```ts
import { getTripBySlug } from "@/server/services/tripService";
import type { BookingRequestValues } from "@/lib/validations/booking";

export async function createBooking(userId: string, input: BookingRequestValues) {
  const trip = await getTripBySlug(input.tripSlug);
  if (!trip) {
    throw new Error("Trip not found.");
  }

  const traveler = await prisma.travelerProfile.create({
    data: {
      userId,
      name: input.traveler.name,
      age: input.traveler.age,
      relationship: input.traveler.relationship,
      healthNotes: input.traveler.healthNotes,
      dietaryNeeds: input.traveler.dietaryNeeds,
    },
  });

  const booking = await prisma.booking.create({
    data: {
      userId,
      tripId: trip.id,
      bookedFor: input.bookedFor,
      travelers: { connect: [{ id: traveler.id }] },
      numTravelers: 1,
      roomType: input.roomType,
      specialCareRequests: input.specialCareRequests,
      totalAmount: trip.basePrice,
      status: "pending",
    },
  });

  return { bookingId: booking.id, totalAmount: booking.totalAmount };
}
```

Add the `import { prisma } from "@/server/db";` line at the top if not already present (it already is, from the existing functions in this file).

- [ ] **Step 3: Write the controller**

`src/app/api/bookings/route.ts`:

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { bookingRequestSchema } from "@/lib/validations/booking";
import { createBooking } from "@/server/services/bookingService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const result = await createBooking(session.user.id, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("createBooking failed:", err);
    const message = err instanceof Error && err.message === "Trip not found."
      ? err.message
      : "Could not create booking.";
    return NextResponse.json({ error: message }, { status: message === "Trip not found." ? 404 : 500 });
  }
}
```

- [ ] **Step 4: Verify against real seeded data**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

In another terminal, without a session cookie (expect 401):

```bash
curl -s -i -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"tripSlug":"sammed-shikharji-yatra","bookedFor":"parent","traveler":{"name":"Test","age":70,"relationship":"parent","healthNotes":[],"dietaryNeeds":[]},"roomType":"single","specialCareRequests":[]}'
```

Expected: `401 {"error":"Not signed in."}`. This confirms the route independently enforces auth rather than relying solely on the proxy. Full authenticated verification happens in Task 6 once the UI exists. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add booking creation service and API route"
```

---

### Task 2: Razorpay order creation + signature verification

**Files:**
- Create: `src/server/services/paymentService.ts`
- Create: `src/app/api/payments/create-order/route.ts`
- Create: `src/app/api/payments/verify/route.ts`

**Interfaces:**
- Consumes: `Booking`/`Payment` models, `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` env vars.
- Produces: `POST /api/payments/create-order` (returns `{ orderId, amount, currency, keyId }`), `POST /api/payments/verify` (returns `{ confirmed: true }` or a 400 on signature mismatch) — consumed by Task 4's review step.

- [ ] **Step 1: Install the official Razorpay SDK**

```bash
pnpm add razorpay
```

- [ ] **Step 2: Write the payment service**

`src/server/services/paymentService.ts`:

```ts
import Razorpay from "razorpay";
import crypto from "node:crypto";
import { prisma } from "@/server/db";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET).");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createOrderForBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) {
    throw new Error("Booking not found.");
  }

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: booking.totalAmount * 100, // paise
    currency: "INR",
    receipt: booking.id,
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: { razorpayOrderId: order.id, amount: booking.totalAmount, status: "created" },
    create: {
      bookingId: booking.id,
      razorpayOrderId: order.id,
      amount: booking.totalAmount,
      status: "created",
    },
  });

  return {
    orderId: order.id,
    amount: booking.totalAmount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
  };
}

export async function verifyAndConfirmPayment(input: {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay is not configured.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== input.razorpaySignature) {
    return { confirmed: false as const };
  }

  await prisma.payment.update({
    where: { bookingId: input.bookingId },
    data: { status: "paid", razorpayPaymentId: input.razorpayPaymentId },
  });
  await prisma.booking.update({
    where: { id: input.bookingId },
    data: { status: "confirmed" },
  });

  return { confirmed: true as const };
}
```

- [ ] **Step 3: Write the create-order controller**

`src/app/api/payments/create-order/route.ts`:

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOrderForBooking } from "@/server/services/paymentService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const bookingId = typeof body?.bookingId === "string" ? body.bookingId : null;
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId." }, { status: 400 });
  }

  try {
    const order = await createOrderForBooking(bookingId, session.user.id);
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("createOrderForBooking failed:", err);
    const message = err instanceof Error ? err.message : "Could not start payment.";
    const isNotFound = message === "Booking not found.";
    return NextResponse.json({ error: message }, { status: isNotFound ? 404 : 500 });
  }
}
```

- [ ] **Step 4: Write the verify controller**

`src/app/api/payments/verify/route.ts`:

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/server/db";
import { verifyAndConfirmPayment } from "@/server/services/paymentService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body ?? {};
  if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== session.user.id) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const result = await verifyAndConfirmPayment({
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!result.confirmed) {
    return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });
  }

  return NextResponse.json({ confirmed: true });
}
```

- [ ] **Step 5: Verify what can be verified without live keys**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors. Full live-order verification happens in Task 6 once real `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are in `.env` — until then, `createOrderForBooking` will throw the clear "Razorpay is not configured" error rather than failing silently or with a cryptic SDK error, which is the correct behavior to confirm now:

```bash
pnpm dev
```

```bash
curl -s -i -X POST http://localhost:3000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"nonexistent"}'
```

Expected: `401 {"error":"Not signed in."}` (auth check runs before the missing-keys check, confirming ordering is correct). Stop the server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Razorpay order creation and signature verification"
```

---

### Task 3: Wizard shell, step indicator, steps 1–2 (who's this for, traveler details)

**Files:**
- Create: `src/components/booking/booking-wizard.tsx`
- Create: `src/components/booking/step-indicator.tsx`
- Create: `src/components/booking/step-who-for.tsx`
- Create: `src/components/booking/step-traveler.tsx`

**Interfaces:**
- Consumes: `bookedForSchema`, `travelerSchema` (Task 1).
- Produces: `<BookingWizard trip={...} />` — the full wizard shell, extended by Task 4 with steps 3–5. `WizardState` type used across all step components.

- [ ] **Step 1: Step indicator**

`src/components/booking/step-indicator.tsx`:

```tsx
const steps = ["Who's this for", "Traveler", "Room & care", "Review"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-6">
      <p className="sr-only" aria-live="polite">
        Step {current + 1} of {steps.length}: {steps[current]}
      </p>
      <ol className="flex items-center gap-2" aria-hidden="true">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={i === current ? "step" : undefined}
              className={
                i <= current
                  ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                  : "flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground"
              }
            >
              {i + 1}
            </span>
            <span
              className={
                i === current
                  ? "hidden text-xs font-semibold text-foreground sm:inline"
                  : "hidden text-xs text-muted-foreground sm:inline"
              }
            >
              {label}
            </span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2: Wizard state shape and shell**

`src/components/booking/booking-wizard.tsx`:

```tsx
"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/booking/step-indicator";
import { StepWhoFor } from "@/components/booking/step-who-for";
import { StepTraveler } from "@/components/booking/step-traveler";
import type { BookedFor, TravelerValues, RoomCareValues } from "@/lib/validations/booking";

export type WizardState = {
  bookedFor: BookedFor | null;
  traveler: TravelerValues | null;
  roomCare: RoomCareValues | null;
};

type TripSummary = {
  slug: string;
  title: string;
  routeSummary: string;
  basePrice: number;
  durationDays: number;
  durationNights: number;
  images: string[];
};

export function BookingWizard({ trip }: { trip: TripSummary }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    bookedFor: null,
    traveler: null,
    roomCare: null,
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <StepIndicator current={step} />

      {step === 0 && (
        <StepWhoFor
          value={state.bookedFor}
          onNext={(bookedFor) => {
            setState((s) => ({ ...s, bookedFor }));
            setStep(1);
          }}
        />
      )}

      {step === 1 && (
        <StepTraveler
          bookedFor={state.bookedFor!}
          value={state.traveler}
          onBack={() => setStep(0)}
          onNext={(traveler) => {
            setState((s) => ({ ...s, traveler }));
            setStep(2);
          }}
        />
      )}

      {/* Steps 2 (room/care) and 3 (review) are added in Task 4 */}
    </div>
  );
}
```

Note: `trip` prop's fields beyond what steps 1–2 use (`basePrice`, `images`, etc.) are unused until Task 4's review step — keep them in the type now since Task 4 extends this same file and needs them, rather than re-deriving the type there.

- [ ] **Step 3: "Who's this for" step**

`src/components/booking/step-who-for.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BookedFor } from "@/lib/validations/booking";

const options: { value: BookedFor; label: string; description: string }[] = [
  { value: "self", label: "Myself", description: "I'm the one traveling." },
  { value: "parent", label: "My parent", description: "Booking and paying for a parent." },
  { value: "nri", label: "NRI booking from abroad", description: "I live outside India." },
];

export function StepWhoFor({
  value,
  onNext,
}: {
  value: BookedFor | null;
  onNext: (value: BookedFor) => void;
}) {
  const [selected, setSelected] = useState<BookedFor | null>(value);

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Who's this trip for?</h1>
      <div className="mt-4 space-y-2" role="radiogroup" aria-label="Who is this trip for">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected === opt.value}
            onClick={() => setSelected(opt.value)}
            className={
              selected === opt.value
                ? "block w-full rounded-lg border-2 border-primary bg-secondary/40 p-4 text-left"
                : "block w-full rounded-lg border border-border p-4 text-left hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            <p className="text-sm font-semibold text-foreground">{opt.label}</p>
            <p className="text-xs text-muted-foreground">{opt.description}</p>
          </button>
        ))}
      </div>
      <Button
        type="button"
        className="mt-6 w-full"
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
      >
        Continue
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Traveler details step**

`src/components/booking/step-traveler.tsx`:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { travelerSchema, type TravelerValues, type BookedFor } from "@/lib/validations/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const relationshipDefaults: Record<BookedFor, string> = {
  self: "self",
  parent: "parent",
  nri: "parent",
};

export function StepTraveler({
  bookedFor,
  value,
  onBack,
  onNext,
}: {
  bookedFor: BookedFor;
  value: TravelerValues | null;
  onBack: () => void;
  onNext: (value: TravelerValues) => void;
}) {
  const form = useForm<TravelerValues>({
    resolver: zodResolver(travelerSchema),
    defaultValues: value ?? {
      name: "",
      age: undefined as unknown as number,
      relationship: relationshipDefaults[bookedFor],
      healthNotes: [],
      dietaryNeeds: [],
    },
  });

  function onSubmit(values: TravelerValues) {
    onNext(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <h1 className="font-heading text-xl font-bold text-foreground">Traveler details</h1>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={120} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship to you</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="healthNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Health notes (comma-separated, optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g. Hypertensive, Type 2 Diabetes"
                  defaultValue={field.value?.join(", ") ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dietaryNeeds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary needs (comma-separated, optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g. Jain Satvik"
                  defaultValue={field.value?.join(", ") ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

- [ ] **Step 5: Verify**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors (the wizard isn't mounted on a page yet — that's Task 5 — so this is a standalone compile check).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add booking wizard shell, step indicator, and first two steps"
```

---

### Task 4: Steps 3–4 (room/care, review) and payment orchestration

**Files:**
- Create: `src/components/booking/step-room-care.tsx`
- Create: `src/components/booking/step-review.tsx`
- Create: `src/lib/razorpay-checkout.ts`
- Modify: `src/components/booking/booking-wizard.tsx`

**Interfaces:**
- Consumes: `roomCareSchema` (Task 1), `POST /api/bookings`, `POST /api/payments/create-order`, `POST /api/payments/verify` (Tasks 1–2).
- Produces: completes `BookingWizard`; on successful payment, navigates to `/book/confirmation/[bookingId]`.

- [ ] **Step 1: Room & care step**

`src/components/booking/step-room-care.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { RoomCareValues } from "@/lib/validations/booking";

const roomTypes: { value: RoomCareValues["roomType"]; label: string }[] = [
  { value: "single", label: "Single occupancy" },
  { value: "twin", label: "Twin sharing" },
  { value: "triple", label: "Triple sharing" },
];

const careOptions = [
  "BP & sugar monitoring",
  "Wheelchair assist",
  "Dedicated companion",
  "Dietary accommodation",
];

export function StepRoomCare({
  value,
  onBack,
  onNext,
}: {
  value: RoomCareValues | null;
  onBack: () => void;
  onNext: (value: RoomCareValues) => void;
}) {
  const [roomType, setRoomType] = useState<RoomCareValues["roomType"]>(
    value?.roomType ?? "single"
  );
  const [careRequests, setCareRequests] = useState<string[]>(value?.specialCareRequests ?? []);

  function toggleCare(option: string) {
    setCareRequests((prev) =>
      prev.includes(option) ? prev.filter((c) => c !== option) : [...prev, option]
    );
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Room & care needs</h1>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Room type
      </p>
      <div className="mt-2 space-y-2" role="radiogroup" aria-label="Room type">
        {roomTypes.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={roomType === opt.value}
            onClick={() => setRoomType(opt.value)}
            className={
              roomType === opt.value
                ? "block w-full rounded-lg border-2 border-primary bg-secondary/40 p-3 text-left text-sm font-semibold text-foreground"
                : "block w-full rounded-lg border border-border p-3 text-left text-sm text-foreground hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Special care requests
      </p>
      <div className="mt-2 space-y-2">
        {careOptions.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2.5 rounded-lg border border-border p-3 text-sm text-foreground"
          >
            <input
              type="checkbox"
              checked={careRequests.includes(option)}
              onChange={() => toggleCare(option)}
              className="size-4 accent-primary"
            />
            {option}
          </label>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={() => onNext({ roomType, specialCareRequests: careRequests })}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Razorpay Checkout.js loader helper**

`src/lib/razorpay-checkout.ts`:

```ts
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser."));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export async function openRazorpayCheckout(options: RazorpayOptions) {
  await loadRazorpayScript();
  const instance = new window.Razorpay(options);
  instance.open();
}
```

- [ ] **Step 3: Review step, with the full payment orchestration**

`src/components/booking/step-review.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import type { BookedFor, TravelerValues, RoomCareValues } from "@/lib/validations/booking";

type TripSummary = {
  slug: string;
  title: string;
  routeSummary: string;
  basePrice: number;
  durationDays: number;
  durationNights: number;
  images: string[];
};

const bookedForLabels: Record<BookedFor, string> = {
  self: "Myself",
  parent: "My parent",
  nri: "NRI booking from abroad",
};

export function StepReview({
  trip,
  bookedFor,
  traveler,
  roomCare,
  onBack,
}: {
  trip: TripSummary;
  bookedFor: BookedFor;
  traveler: TravelerValues;
  roomCare: RoomCareValues;
  onBack: () => void;
}) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    setPaying(true);
    try {
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripSlug: trip.slug,
          bookedFor,
          traveler,
          roomType: roomCare.roomType,
          specialCareRequests: roomCare.specialCareRequests,
        }),
      });
      if (!bookingRes.ok) {
        const data = await bookingRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not create booking.");
      }
      const { bookingId } = await bookingRes.json();

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not start payment.");
      }
      const order = await orderRes.json();

      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        order_id: order.orderId,
        name: "Mitram",
        description: trip.title,
        handler: async (response) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) {
            toast.error("Payment could not be verified. Please contact support.");
            setPaying(false);
            return;
          }
          router.push(`/book/confirmation/${bookingId}`);
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
      <h1 className="font-heading text-xl font-bold text-foreground">Review & pay</h1>

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
            {trip.routeSummary} · {trip.durationDays}D/{trip.durationNights}N
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Booking for</dt>
          <dd className="text-foreground">{bookedForLabels[bookedFor]}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Traveler</dt>
          <dd className="text-foreground">
            {traveler.name}, {traveler.age}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Room</dt>
          <dd className="text-foreground capitalize">{roomCare.roomType}</dd>
        </div>
        {roomCare.specialCareRequests.length > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Care requests</dt>
            <dd className="text-right text-foreground">
              {roomCare.specialCareRequests.join(", ")}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="font-heading text-2xl font-bold text-primary">
          ₹{trip.basePrice.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack} disabled={paying}>
          Back
        </Button>
        <Button type="button" className="flex-1" onClick={handlePay} disabled={paying}>
          {paying ? "Processing..." : `Pay ₹${trip.basePrice.toLocaleString("en-IN")}`}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire steps 3–4 into the wizard shell**

Modify `src/components/booking/booking-wizard.tsx` — add the two new imports and render branches:

```tsx
import { StepRoomCare } from "@/components/booking/step-room-care";
import { StepReview } from "@/components/booking/step-review";
```

Replace the `{/* Steps 2 (room/care) and 3 (review) are added in Task 4 */}` comment with:

```tsx
{step === 2 && (
  <StepRoomCare
    value={state.roomCare}
    onBack={() => setStep(1)}
    onNext={(roomCare) => {
      setState((s) => ({ ...s, roomCare }));
      setStep(3);
    }}
  />
)}

{step === 3 && state.bookedFor && state.traveler && state.roomCare && (
  <StepReview
    trip={trip}
    bookedFor={state.bookedFor}
    traveler={state.traveler}
    roomCare={state.roomCare}
    onBack={() => setStep(2)}
  />
)}
```

- [ ] **Step 5: Verify**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors. Full click-through verification happens in Task 5 once the wizard is mounted on a real page.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add room/care and review steps with Razorpay payment orchestration"
```

---

### Task 5: Booking page + confirmation page

**Files:**
- Create: `src/app/book/[tripSlug]/page.tsx`
- Create: `src/app/book/confirmation/[bookingId]/page.tsx`

**Interfaces:**
- Consumes: `getTripBySlug` (`tripService`), `BookingWizard` (Task 3–4), `getBookingById` (`bookingService`), `auth()`.

- [ ] **Step 1: Booking page**

`src/app/book/[tripSlug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { getTripBySlug } from "@/server/services/tripService";

export default async function BookTripPage({
  params,
}: {
  params: Promise<{ tripSlug: string }>;
}) {
  const { tripSlug } = await params;
  const trip = await getTripBySlug(tripSlug);

  if (!trip) {
    notFound();
  }

  return (
    <BookingWizard
      trip={{
        slug: trip.slug,
        title: trip.title,
        routeSummary: trip.routeSummary,
        basePrice: trip.basePrice,
        durationDays: trip.durationDays,
        durationNights: trip.durationNights,
        images: trip.images,
      }}
    />
  );
}
```

- [ ] **Step 2: Confirmation page (ownership-checked)**

`src/app/book/confirmation/[bookingId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { getBookingById } from "@/server/services/bookingService";
import { Button } from "@/components/ui/button";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking || booking.userId !== session.user.id) {
    notFound();
  }

  const traveler = booking.travelers[0];

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center sm:px-6">
      <CheckCircle2 className="mx-auto size-12 text-primary" aria-hidden="true" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Booking confirmed</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Booking ID: <span className="font-mono">{booking.id}</span>
      </p>

      <div className="mt-6 rounded-lg border border-border bg-card p-5 text-left">
        <div className="flex gap-3">
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
            <Image
              src={
                booking.trip.images[0] ??
                "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=200&q=70"
              }
              alt={booking.trip.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{booking.trip.title}</p>
            <p className="text-xs text-muted-foreground">{booking.trip.routeSummary}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          {traveler && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Traveler</dt>
              <dd className="text-foreground">{traveler.name}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Room</dt>
            <dd className="text-foreground capitalize">{booking.roomType}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="font-semibold text-foreground">Amount paid</dt>
            <dd className="font-semibold text-primary">
              ₹{booking.totalAmount.toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>
      </div>

      <Button asChild className="mt-6">
        <Link href="/dashboard">View my bookings</Link>
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Visit `http://localhost:3000/book/sammed-shikharji-yatra` while logged out — confirm the proxy redirects to `/login?callbackUrl=...`. Log in, land back on the wizard. Click through steps 1–3 (who's this for → traveler → room/care), confirm the step indicator advances and Back buttons work with state preserved. On the review step, confirm the trip summary/price render correctly from real seeded data. Stop the server without completing payment yet (real keys aren't in `.env`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add booking page and confirmation page"
```

---

### Task 6: Cross-page verification

**Files:** No new files — verification and any small fixes found.

- [ ] **Step 1: Full click-through with real Razorpay test keys, if available**

If `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are populated in `.env` by this point, run the entire flow end to end: `/book/sammed-shikharji-yatra` → all 4 steps → Razorpay test-mode Checkout popup → complete with a Razorpay test card → confirm redirect to `/book/confirmation/[bookingId]` with the correct summary. Then confirm in the database:

```bash
psql -U postgres -h localhost -d mitram -c "SELECT status FROM \"Booking\" ORDER BY \"createdAt\" DESC LIMIT 1;"
psql -U postgres -h localhost -d mitram -c "SELECT status, \"razorpayPaymentId\" FROM \"Payment\" ORDER BY \"createdAt\" DESC LIMIT 1;"
```

Expected: `status = confirmed` and `status = paid` respectively. If keys aren't populated yet, skip this step (it isn't blocking — the API contract was already verified in Tasks 1–2) and note it as a follow-up for whenever the user adds real test keys.

- [ ] **Step 2: Ownership check on the confirmation page**

While logged in as one user, try visiting another user's `/book/confirmation/[bookingId]` (use the seeded demo booking's ID, `demo-booking-1`, while logged in as a *different* account than `arjun.jain@example.com`). Confirm it 404s rather than showing someone else's booking.

- [ ] **Step 3: Keyboard-only pass**

Tab through the entire wizard: who's-for radio options → traveler form fields → room/care radio + checkboxes → review's Back/Pay buttons. Confirm every stop has a visible focus ring and the step indicator's current step is conveyed to screen readers (inspect the `aria-current`/visually-hidden text, not just visually).

- [ ] **Step 4: Gold-contrast and landmark check**

```bash
grep -rn "text-accent\b" src/components/booking src/app/book
```

Expected: no matches (or only `-foreground`, which is correct).

- [ ] **Step 5: Typecheck, lint, build**

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
rm -rf .next
```

Fix anything either reports before proceeding.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: verify booking wizard end-to-end and accessibility"
```

## Definition of done for this plan

- `/book/[tripSlug]` walks through all 4 input steps with real validation, state preserved across Back/Next.
- Booking creation computes price server-side from the real `Trip.basePrice` — never trusts client input for money.
- Razorpay order creation and signature verification follow the official pattern; payment success is only ever set after server-side signature verification.
- `/book/confirmation/[bookingId]` is ownership-checked and shows real booking data.
- WCAG 2.1 AA checks pass.
- **Not yet built** (next plan): the dashboard "My Bookings" list that `/book/confirmation`'s "View my bookings" link points to.
