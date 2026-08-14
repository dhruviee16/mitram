import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";
import { auth } from "@/auth";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    const { callbackUrl } = await searchParams;
    redirect(getSafeCallbackUrl(callbackUrl ?? null) === "/" ? "/dashboard" : getSafeCallbackUrl(callbackUrl ?? null));
  }

  return (
    <AuthLayout
      title="Your next journey starts here."
      subtitle="Sign in to manage your family's trips."
      showPartnerLink
    >
      <Suspense fallback={null}>
        <LoginForm variant="customer" />
      </Suspense>
    </AuthLayout>
  );
}
