"use client";

import { useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { useUploadVendorImage } from "@/hooks/use-upload-vendor-image";

// Every upload goes through /api/vendor/uploads, which streams the file to
// Cloudflare R2 and hands back its public URL (see src/server/r2.ts).
export function ImageUpload({
  value,
  onChange,
  max,
  camera = false,
  disabled = false,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  camera?: boolean;
  disabled?: boolean;
}) {
  const uploadImage = useUploadVendorImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const atMax = max !== undefined && value.length >= max;

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const room = max !== undefined ? max - value.length : files.length;
    for (const file of files.slice(0, room)) {
      try {
        const { url } = await uploadImage.mutateAsync(file);
        onChange([...value, url]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not upload image.");
      }
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div key={url} className="relative size-24 overflow-hidden rounded-md border border-border">
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              aria-label="Remove photo"
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-foreground/70 text-background"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </div>
        ))}
        {!atMax && (
          <div className="flex gap-2">
            {camera && (
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled || uploadImage.isPending}
                className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
              >
                <Camera className="size-5" aria-hidden="true" />
                {uploadImage.isPending ? "Uploading..." : "Take photo"}
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploadImage.isPending}
              className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {uploadImage.isPending ? "Uploading..." : "+ Add photo"}
            </button>
          </div>
        )}
      </div>
      {camera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleSelect}
          className="hidden"
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={max === undefined || max > 1}
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  );
}
