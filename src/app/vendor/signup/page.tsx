import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VendorSignupForm } from "@/components/vendor/vendor-signup-form";
import { auth } from "@/auth";

export default async function VendorSignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect(
      (session.user as { role?: string }).role === "vendor" ? "/vendor/dashboard" : "/"
    );
  }

  return (
    <AuthLayout
      title="List your trips on Mitram"
      subtitle="Reach families booking safe, senior-friendly travel."
    >
      <VendorSignupForm />
    </AuthLayout>
  );
}
