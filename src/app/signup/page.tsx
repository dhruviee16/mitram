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
