"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdateDestination, type DestinationInput } from "@/hooks/use-update-destination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function DestinationForm({
  id,
  defaultValues,
}: {
  id: string;
  defaultValues: DestinationInput;
}) {
  const router = useRouter();
  const updateDestination = useUpdateDestination(id);
  const [heroImage, setHeroImage] = useState(defaultValues.heroImage);

  const form = useForm<DestinationInput>({ defaultValues });

  function onSubmit(values: DestinationInput) {
    updateDestination.mutate(
      { ...values, heroImage },
      {
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save destination."),
        onSuccess: () => {
          toast.success("Destination updated.");
          router.push("/admin/destinations");
          router.refresh();
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Enter a destination name." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Kerala" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bestTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Best time to visit</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. October to March" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormDescription>Shown clamped to 2 lines on destination cards.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Photo</FormLabel>
          <ImageUpload
            value={heroImage ? [heroImage] : []}
            onChange={(urls) => setHeroImage(urls[0] ?? "")}
            max={1}
          />
          <FormDescription>
            A destination only appears on the homepage or destinations page once it has a photo.
          </FormDescription>
        </FormItem>

        <Button type="submit" className="min-h-11" disabled={updateDestination.isPending}>
          {updateDestination.isPending ? "Saving..." : "Save destination"}
        </Button>
      </form>
    </Form>
  );
}
