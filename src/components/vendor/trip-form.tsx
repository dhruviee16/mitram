"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";

import { TRIP_CATEGORIES } from "@/lib/trip-categories";
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

type TripFormDefaultValues = {
  title: string;
  category: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  images: string;
  careFeatures: string;
  inclusions: string;
  summary: string;
  days: { dayNumber: number; title: string; description: string; activities: string }[];
};

const emptyDefaults: TripFormDefaultValues = {
  title: "",
  category: TRIP_CATEGORIES[0].value,
  routeSummary: "",
  durationDays: 1,
  durationNights: 0,
  basePrice: 0,
  images: "",
  careFeatures: "",
  inclusions: "",
  summary: "",
  days: [{ dayNumber: 1, title: "", description: "", activities: "" }],
};

export function TripForm({
  mode,
  tripId,
  defaultValues,
}: {
  mode: "create" | "edit";
  tripId?: string;
  defaultValues?: TripFormDefaultValues;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TripFormDefaultValues>({
    defaultValues: defaultValues ?? emptyDefaults,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "days" });

  async function onSubmit(values: TripFormDefaultValues) {
    setSubmitting(true);

    const url = mode === "create" ? "/api/vendor/trips" : `/api/vendor/trips/${tripId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Could not save trip." }));
      toast.error(data.error ?? "Could not save trip.");
      setSubmitting(false);
      return;
    }

    toast.success(mode === "create" ? "Trip created." : "Trip updated.");
    router.push("/vendor/dashboard");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRIP_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
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
          name="routeSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route summary</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Delhi → Haridwar → Rishikesh" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationNights"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nights</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base price (INR)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URLs (one per line)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="careFeatures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Care features (one per line)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} placeholder="Wheelchair-accessible coach" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inclusions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inclusions (one per line)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} placeholder="All meals" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">Itinerary</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ dayNumber: fields.length + 1, title: "", description: "", activities: "" })
              }
            >
              Add day
            </Button>
          </div>

          {fields.map((day, index) => (
            <div key={day.id} className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Day {index + 1}</p>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    Remove
                  </Button>
                )}
              </div>
              <FormField
                control={form.control}
                name={`days.${index}.dayNumber`}
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`days.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`days.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`days.${index}.activities`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activities (one per line)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : mode === "create" ? "Create trip" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
