import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/auth";

export default async function VendorLoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect((session.user as { role?: string }).role === "vendor" ? "/vendor/dashboard" : "/");
  }

  return (
    <AuthLayout title="Grow your travel business with MITRAM." subtitle="Sign in to your vendor dashboard.">
      <Suspense fallback={null}>
        <LoginForm variant="vendor" />
      </Suspense>
    </AuthLayout>
  );
}
