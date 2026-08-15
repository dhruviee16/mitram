import { useMutation } from "@tanstack/react-query";

async function uploadVendorImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/vendor/uploads", { method: "POST", body });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not upload image.");
  }

  return res.json() as Promise<{ url: string }>;
}

export function useUploadVendorImage() {
  return useMutation({ mutationFn: uploadVendorImage });
}
