import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";
import { auth } from "@/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    const { callbackUrl } = await searchParams;
    redirect(getSafeCallbackUrl(callbackUrl ?? null));
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Book and track trips for the people you love."
    >
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
