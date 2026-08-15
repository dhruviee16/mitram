"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";

import { vendorTripUpdateSchema, type VendorTripUpdateValues } from "@/lib/validations/vendor";
import { usePostTripUpdate } from "@/hooks/use-post-trip-update";
import { useUploadVendorImage } from "@/hooks/use-upload-vendor-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function TripUpdateForm({ bookingId, stops }: { bookingId: string; stops: string[] }) {
  const router = useRouter();
  const postTripUpdate = usePostTripUpdate();
  const uploadImage = useUploadVendorImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  const form = useForm<VendorTripUpdateValues>({
    resolver: zodResolver(vendorTripUpdateSchema),
    defaultValues: {
      locationLabel: "",
      note: "",
      healthBp: "",
      healthSugar: "",
      healthTemp: "",
    },
  });

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      setPhotoUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload photo.");
    }
  }

  function onSubmit(values: VendorTripUpdateValues) {
    postTripUpdate.mutate(
      { bookingId, values: { ...values, photoUrl } },
      {
        onSuccess: () => {
          toast.success("Update posted.");
          form.reset();
          setPhotoUrl(undefined);
          router.refresh();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="locationLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stop reached</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a stop on the route" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stops.map((stop) => (
                    <SelectItem key={stop} value={stop}>
                      {stop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (optional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Photo (optional)</FormLabel>
          {photoUrl ? (
            <div className="relative size-24 overflow-hidden rounded-md border border-border">
              <Image src={photoUrl} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => setPhotoUrl(undefined)}
                aria-label="Remove photo"
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-foreground/70 text-background"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadImage.isPending}
                className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
              >
                <Camera className="size-5" aria-hidden="true" />
                {uploadImage.isPending ? "Uploading..." : "Take photo"}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadImage.isPending}
                className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {uploadImage.isPending ? "Uploading..." : "+ Add photo"}
              </button>
            </div>
          )}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </FormItem>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="healthBp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BP</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="120/80" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="healthSugar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sugar</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="110 mg/dL" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="healthTemp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temp</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="98.4°F" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={postTripUpdate.isPending || uploadImage.isPending}>
          {postTripUpdate.isPending ? "Posting..." : "Post update"}
        </Button>
      </form>
    </Form>
  );
}
