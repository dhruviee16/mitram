import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listTestimonials } from "@/server/services/adminService";
import { AdminNav } from "@/components/admin/admin-nav";
import { TestimonialActions } from "@/components/admin/testimonial-actions";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type TestimonialRow = Awaited<ReturnType<typeof listTestimonials>>[number];

export default async function AdminTestimonialsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const testimonials = await listTestimonials();

  const columns: DataTableColumn<TestimonialRow>[] = [
    {
      header: "Testimonial",
      cell: (t) => (
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
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (t) => <TestimonialActions id={t.id} featured={t.featured} />,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/testimonials" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Testimonials</h1>

      <div className="mt-6">
        <DataTable columns={columns} data={testimonials} rowKey={(t) => t.id} emptyMessage="No testimonials yet." />
      </div>
    </div>
  );
}
