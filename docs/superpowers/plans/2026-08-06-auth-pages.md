# MITRAM Auth Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/login` and `/signup` — split form+image layout matching shadcn's `login-04`/`signup-04` pattern, wired to the existing `authService`/NextAuth credentials setup, unblocking the booking wizard and dashboard (both session-gated).

**Architecture:** Client-side form components (react-hook-form + zod + the existing `Form` primitives) inside server-component pages. Login calls NextAuth's `signIn` directly. Signup calls a new thin `POST /api/auth/register` controller that delegates to the already-existing `authService.registerUser`, then the client signs the new user in the same way login does.

**Tech Stack:** Next.js App Router, react-hook-form, zod, NextAuth v5 client `signIn`, existing shadcn `Form`/`Input`/`Button`/`Card` primitives, `sonner` for error feedback.

This plan corresponds to spec: `docs/superpowers/specs/2026-08-06-auth-pages-design.md`.

## Global Constraints

- Email/password only — no OAuth, no OTP, no "Forgot password" link (spec explicitly excludes these).
- Real photo for the image side (`public/images/trips/*.jpg`), no new stock imagery.
- Both pages read `callbackUrl` from `useSearchParams()`, wrapped in `Suspense` (same requirement `/trips` already handles).
- WCAG 2.1 AA: real `<label>`s via `FormLabel`, inline validation via `FormMessage`, visible focus rings, one `<h1>` per page, gold `#F5A623` never as text/icon color on light backgrounds.
- Don't leak which field was wrong on login failure — generic "Incorrect email or password" message, matching the timing-safe behavior already built into `authService.verifyCredentials`.

---

### Task 1: Shared zod schemas and the split auth layout shell

**Files:**
- Create: `src/lib/validations/auth.ts`
- Create: `src/components/auth/auth-split-layout.tsx`

**Interfaces:**
- Produces: `loginSchema`, `signupSchema` (zod), `LoginValues`/`SignupValues` types — consumed by Task 2 and Task 4's forms. `<AuthSplitLayout>` — consumed by Task 3 and Task 5's pages.

- [ ] **Step 1: Write the zod schemas**

`src/lib/validations/auth.ts`:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(1, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignupValues = z.infer<typeof signupSchema>;
```

- [ ] **Step 2: Write the shared split layout**

Server-renderable (no client hooks) — the image side is static, the form side is `children`.

`src/components/auth/auth-split-layout.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

export function AuthSplitLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <Link href="/" className="font-heading text-xl font-bold text-primary">
          Mitram
        </Link>
        <div className="mt-8 max-w-sm">
          <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image
          src="/images/trips/sammed-shikharji-yatra.jpg"
          alt="Pilgrims ascending Sammed Shikharji at sunrise"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="font-heading text-xl font-bold text-white">
            A yatra with dignity, done safely.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors (component isn't rendered anywhere yet, this just confirms it compiles standalone).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add auth zod schemas and shared split layout"
```

---

### Task 2: Login form + page

**Files:**
- Create: `src/components/auth/login-form.tsx`
- Create: `src/app/login/page.tsx`

**Interfaces:**
- Consumes: `loginSchema`/`LoginValues` (Task 1), `AuthSplitLayout` (Task 1), `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` (`@/components/ui/form`), `signIn` from `@/auth` — actually from `next-auth/react` client hook (see note below).
- Produces: `/login` route.

**Note on `signIn`:** the `signIn` exported from `src/auth.ts` is the *server-side* helper (for server actions/route handlers). Client components must import the client-side version from `next-auth/react` instead — `import { signIn } from "next-auth/react"`. This requires a `SessionProvider` ancestor for full functionality, but `signIn()` itself works without one since it does a direct fetch to the NextAuth API route.

- [ ] **Step 1: Write the login form**

`src/components/auth/login-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

import { loginSchema, type LoginValues } from "@/lib/validations/auth";
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setSubmitting(false);

    if (result?.error) {
      toast.error("Incorrect email or password.");
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href={`/signup${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </Form>
  );
}
```

- [ ] **Step 2: Install the zod/react-hook-form resolver bridge if not already present**

```bash
grep -q '"@hookform/resolvers"' package.json || pnpm add @hookform/resolvers
```

(It's already a dependency from setup — this step is a no-op verification, not a fresh install.)

- [ ] **Step 3: Write the page**

`src/app/login/page.tsx`:

```tsx
import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Sign in to manage your family's trips."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
```

- [ ] **Step 4: Verify**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Visit `http://localhost:3000/login`. Confirm: split layout renders with the real Shikharji photo on the right (desktop width), form on the left, tabbing through email → password → submit → "Create an account" link all show visible focus rings. Submit with a nonexistent email — confirm a toast reads "Incorrect email or password." (no hint about which field). Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add login page and form"
```

---

### Task 3: Registration API route

**Files:**
- Create: `src/app/api/auth/register/route.ts`

**Interfaces:**
- Consumes: `signupSchema` (Task 1), `registerUser` from `@/server/services/authService` (already exists from setup).
- Produces: `POST /api/auth/register` — `{ name, email, password }` → `201` with the created user's public fields, or `409` with `{ error: string }` on duplicate email, or `400` with `{ error: string }` on validation failure.

- [ ] **Step 1: Write the route**

`src/app/api/auth/register/route.ts`:

```ts
import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations/auth";
import { registerUser } from "@/server/services/authService";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const user = await registerUser(
      parsed.data.email,
      parsed.data.password,
      parsed.data.name
    );
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create account.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
```

- [ ] **Step 2: Verify end-to-end against the real database**

```bash
pnpm dev
```

In another terminal:

```bash
curl -s -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test-auth-plan@example.com","password":"password123"}'
```

Expected: `201` with the user JSON (no `passwordHash` field — `authService.registerUser` already returns only public fields). Run the same command again — expected: `409` with `{"error":"An account with this email already exists."}`. Clean up the test row:

```bash
psql -U postgres -h localhost -d mitram -c "DELETE FROM \"User\" WHERE email = 'test-auth-plan@example.com';"
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add registration API route"
```

---

### Task 4: Signup form + page

**Files:**
- Create: `src/components/auth/signup-form.tsx`
- Create: `src/app/signup/page.tsx`

**Interfaces:**
- Consumes: `signupSchema`/`SignupValues` (Task 1), `AuthSplitLayout` (Task 1), `POST /api/auth/register` (Task 3), `signIn` from `next-auth/react`.
- Produces: `/signup` route.

- [ ] **Step 1: Write the signup form**

`src/components/auth/signup-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

import { signupSchema, type SignupValues } from "@/lib/validations/auth";
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

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: SignupValues) {
    setSubmitting(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Could not create account." }));
      toast.error(data.error ?? "Could not create account.");
      setSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setSubmitting(false);

    if (result?.error) {
      toast.error("Account created — please sign in.");
      router.push("/login");
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/login${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
```

- [ ] **Step 2: Write the page**

`src/app/signup/page.tsx`:

```tsx
import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthSplitLayout
      title="Create your account"
      subtitle="Book and track trips for the people you love."
    >
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
```

- [ ] **Step 3: Verify end-to-end**

```bash
pnpm dev
```

Visit `http://localhost:3000/signup`. Fill in a new name/email/8+ character password, submit — confirm redirect to `/` and that a session now exists (check `curl -s http://localhost:3000/api/auth/session` in another terminal shows the user, or add a temporary check). Try signing up with the same email again — confirm a toast shows the duplicate-email error. Try a password under 8 characters — confirm inline `FormMessage` blocks submission before any network call. Clean up the test account:

```bash
psql -U postgres -h localhost -d mitram -c "DELETE FROM \"User\" WHERE email = '<the test email you used>';"
```

Stop the server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add signup page and form"
```

---

### Task 5: Cross-page verification — redirect flow and accessibility

**Files:** No new files — verification and any small fixes found.

- [ ] **Step 1: Full redirect-flow test**

```bash
pnpm dev
```

Visit `http://localhost:3000/dashboard` while logged out — confirm the proxy redirects to `/login?callbackUrl=%2Fdashboard`. Log in with a valid account — confirm you land back on `/dashboard` (not `/`), proving the `callbackUrl` round-trip works end to end.

- [ ] **Step 2: Keyboard-only pass**

Tab through both pages start to finish: logo link → form fields → submit button → the login/signup cross-link. Confirm every stop has a visible focus ring and the tab order is logical (top to bottom, no jumps into the hidden-on-mobile image side).

- [ ] **Step 3: Gold-contrast and landmark check**

Confirm neither page uses `#F5A623`/`accent` as a text or icon color anywhere, and that each page has exactly one `<h1>` (the `AuthSplitLayout` title).

```bash
grep -rn "text-accent\b" src/components/auth src/app/login src/app/signup
```

Expected: no matches (or only `text-accent-foreground`, which is correct usage).

- [ ] **Step 4: Typecheck, lint, build**

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Fix anything either reports before proceeding. Remove the `.next` build output afterward if not needed:

```bash
rm -rf .next
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: verify auth pages redirect flow and accessibility"
```

## Definition of done for this plan

- `/login` and `/signup` render the split form+image layout with real MITRAM photography.
- Login authenticates against real seeded/created users via the existing `authService`; wrong credentials show a generic, non-enumerating error.
- Signup creates a real user via `POST /api/auth/register`, then signs them in automatically.
- `callbackUrl` round-trips correctly from a protected-route redirect through login/signup back to the original destination.
- No OAuth, no OTP, no password-reset link — matches spec.
- WCAG 2.1 AA checks (focus rings, contrast, landmarks) pass.
- **Not yet built** (next plan): the booking wizard, which is what `/book/[tripSlug]` — currently a dead link from the trip detail page's "Book Now" — will actually resolve to.
