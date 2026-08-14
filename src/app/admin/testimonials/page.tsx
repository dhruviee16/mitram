import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listTestimonials } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";
import { TestimonialActions } from "@/components/admin/testimonial-actions";
import { Badge } from "@/components/ui/badge";

export default async function AdminTestimonialsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const testimonials = await listTestimonials();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/testimonials" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Testimonials</h1>

      <ul className="mt-6 space-y-3" role="list">
        {testimonials.map((t) => (
          <li key={t.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  {t.isSample && <Badge variant="secondary">Sample</Badge>}
                  {t.featured && <Badge>Featured</Badge>}
                </div>
                <p className="mt-1 text-sm italic text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[t.tripTitle, t.city].filter(Boolean).join(" · ")}
                </p>
              </div>
              <TestimonialActions id={t.id} featured={t.featured} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
