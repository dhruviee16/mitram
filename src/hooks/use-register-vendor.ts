import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api";

// react-hook-form's zodResolver hands onSubmit the schema's *output* type
// (post-transform), which differs from the raw form values — accept the
// broader shape here rather than importing the input-typed schema type.
export function useRegisterVendor() {
  return useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      postJson<{ id: string; email: string; name: string; role: string }>("/api/vendor/register", values),
  });
}
