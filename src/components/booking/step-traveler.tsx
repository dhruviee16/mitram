"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { travelerSchema, type TravelerValues, type BookedFor } from "@/lib/validations/booking";

type TravelerFormInput = z.input<typeof travelerSchema>;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const relationshipDefaults: Record<BookedFor, string> = {
  self: "self",
  parent: "parent",
  nri: "parent",
};

export function StepTraveler({
  bookedFor,
  value,
  onBack,
  onNext,
}: {
  bookedFor: BookedFor;
  value: TravelerValues | null;
  onBack: () => void;
  onNext: (value: TravelerValues) => void;
}) {
  const form = useForm<TravelerFormInput, unknown, TravelerValues>({
    resolver: zodResolver(travelerSchema),
    defaultValues: value ?? {
      name: "",
      age: undefined as unknown as number,
      relationship: relationshipDefaults[bookedFor],
      healthNotes: [],
      dietaryNeeds: [],
    },
  });

  function onSubmit(values: TravelerValues) {
    onNext(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <h1 className="font-heading text-xl font-bold text-foreground">Traveler details</h1>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  {...field}
                  value={(field.value as number | string | undefined) ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship to you</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="healthNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Health notes (comma-separated, optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g. Hypertensive, Type 2 Diabetes"
                  defaultValue={field.value?.join(", ") ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dietaryNeeds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary needs (comma-separated, optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g. Jain Satvik"
                  defaultValue={field.value?.join(", ") ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
