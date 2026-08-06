"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { vendorTripUpdateSchema, type VendorTripUpdateValues } from "@/lib/validations/vendor";
import { usePostTripUpdate } from "@/hooks/use-post-trip-update";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function TripUpdateForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const postTripUpdate = usePostTripUpdate();

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

  function onSubmit(values: VendorTripUpdateValues) {
    postTripUpdate.mutate(
      { bookingId, values },
      {
        onSuccess: () => {
          toast.success("Update posted.");
          form.reset();
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
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Rishikesh — Laxman Jhula" />
              </FormControl>
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
        <Button type="submit" disabled={postTripUpdate.isPending}>
          {postTripUpdate.isPending ? "Posting..." : "Post update"}
        </Button>
      </form>
    </Form>
  );
}
