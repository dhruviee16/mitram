import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api";
import type { SignupValues } from "@/lib/validations/auth";

export function useRegisterCustomer() {
  return useMutation({
    mutationFn: (values: SignupValues) =>
      postJson<{ id: string; email: string }>("/api/auth/register", values),
  });
}
