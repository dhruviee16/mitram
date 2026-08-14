"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { X } from "lucide-react";

import { TRIP_CATEGORIES } from "@/lib/trip-categories";
import { walkingIntensityValues, mealsPlanValues } from "@/lib/validations/vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type TripFormDefaultValues = {
  title: string;
  category: string;
  destinationId: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  images: string[];
  careFeatures: string;
  inclusions: string;
  exclusions: string;
  summary: string;
  walkingIntensity: (typeof walkingIntensityValues)[number];
  groupSizeMin: number | undefined;
  groupSizeMax: number | undefined;
  ageGroupMin: number | undefined;
  ageGroupMax: number | undefined;
  hotelCategory: number | undefined;
  mealsPlan: string[];
  insuranceIncluded: boolean;
  coordinatorIncluded: boolean;
  accessibilityNotes: string;
  days: {
    dayNumber: number;
    title: string;
    description: string;
    activities: string;
  }[];
  dates: { departureDate: string; seatsTotal: number }[];
};

const emptyDefaults: TripFormDefaultValues = {
  title: "",
  category: TRIP_CATEGORIES[0].value,
  destinationId: "",
  routeSummary: "",
  durationDays: 1,
  durationNights: 0,
  basePrice: 0,
  images: [],
  careFeatures: "",
  inclusions: "",
  exclusions: "",
  summary: "",
  walkingIntensity: "easy",
  groupSizeMin: undefined,
  groupSizeMax: undefined,
  ageGroupMin: undefined,
  ageGroupMax: undefined,
  hotelCategory: undefined,
  mealsPlan: [],
  insuranceIncluded: false,
  coordinatorIncluded: true,
  accessibilityNotes: "",
  days: [{ dayNumber: 1, title: "", description: "", activities: "" }],
  dates: [{ departureDate: "", seatsTotal: 20 }],
};

export function TripForm({
  mode,
  tripId,
  destinations,
  defaultValues,
}: {
  mode: "create" | "edit";
  tripId?: string;
  destinations: { id: string; name: string }[];
  defaultValues?: TripFormDefaultValues;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TripFormDefaultValues>({
    defaultValues: defaultValues ?? emptyDefaults,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "days",
  });
  const dateFields = useFieldArray({
    control: form.control,
    name: "dates",
  });
  const [images, setImages] = useState<string[]>(defaultValues?.images ?? []);
  const mealsPlan = form.watch("mealsPlan");

  function toggleMeal(meal: string) {
    const next = mealsPlan.includes(meal) ? mealsPlan.filter((m) => m !== meal) : [...mealsPlan, meal];
    form.setValue("mealsPlan", next);
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    e.target.value = "";
    setUploading(true);

    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/vendor/uploads", { method: "POST", body });
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Could not upload image." }));
        toast.error(data.error ?? "Could not upload image.");
        continue;
      }
      const { url } = (await res.json()) as { url: string };
      setImages((prev) => [...prev, url]);
    }

    setUploading(false);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: TripFormDefaultValues) {
    setSubmitting(true);

    const url =
      mode === "create" ? "/api/vendor/trips" : `/api/vendor/trips/${tripId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, images }),
    });

    if (!res.ok) {
      const data = await res
        .json()
        .catch(() => ({ error: "Could not save trip." }));
      toast.error(data.error ?? "Could not save trip.");
      setSubmitting(false);
      return;
    }

    toast.success(mode === "create" ? "Trip submitted for MITRAM approval." : "Trip updated.");
    router.push("/vendor/dashboard");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
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

        <div className="grid grid-cols-2 gap-4">
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
            name="destinationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a destination" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="routeSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route stops</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Delhi, Haridwar, Rishikesh" />
              </FormControl>
              <FormDescription>
                Just the place names, separated by commas — we&rsquo;ll add the arrows for you.
              </FormDescription>
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

        <FormItem>
          <FormLabel>Photos</FormLabel>
          <div className="flex flex-wrap gap-3">
            {images.map((url, index) => (
              <div
                key={url}
                className="relative size-24 overflow-hidden rounded-md border border-border"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "+ Add photo"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </FormItem>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <h2 className="font-heading text-base font-bold text-foreground">Senior-care details</h2>

          <FormField
            control={form.control}
            name="walkingIntensity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Walking intensity</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {walkingIntensityValues.map((v) => (
                      <SelectItem key={v} value={v} className="capitalize">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="groupSizeMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group size (min)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupSizeMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group size (max)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ageGroupMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age group (min)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ageGroupMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age group (max)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hotelCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel category (stars)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={5} {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <FormLabel>Meals plan</FormLabel>
            <div className="flex gap-4">
              {mealsPlanValues.map((meal) => (
                <label key={meal} className="flex min-h-11 items-center gap-2 text-sm capitalize text-foreground">
                  <input
                    type="checkbox"
                    checked={mealsPlan.includes(meal)}
                    onChange={() => toggleMeal(meal)}
                    className="size-[18px] accent-primary"
                  />
                  {meal}
                </label>
              ))}
            </div>
          </FormItem>

          <div className="flex items-center justify-between">
            <FormLabel>Insurance included</FormLabel>
            <FormField
              control={form.control}
              name="insuranceIncluded"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <FormLabel>MITRAM coordinator included</FormLabel>
            <FormField
              control={form.control}
              name="coordinatorIncluded"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="accessibilityNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accessibility notes</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} placeholder="Wheelchair/porter assistance available on request" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="careFeatures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Care features (one per line)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  {...field}
                  placeholder="Wheelchair-accessible coach"
                />
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

        <FormField
          control={form.control}
          name="exclusions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exclusions (one per line)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} placeholder="Flight tickets" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">Departure dates</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dateFields.append({ departureDate: "", seatsTotal: 20 })}
            >
              Add date
            </Button>
          </div>
          {dateFields.fields.map((date, index) => (
            <div key={date.id} className="flex items-end gap-3">
              <FormField
                control={form.control}
                name={`dates.${index}.departureDate`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Departure date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`dates.${index}.seatsTotal`}
                render={({ field }) => (
                  <FormItem className="w-28">
                    <FormLabel>Seats</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {dateFields.fields.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => dateFields.remove(index)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Itinerary
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  dayNumber: fields.length + 1,
                  title: "",
                  description: "",
                  activities: "",
                })
              }
            >
              Add day
            </Button>
          </div>

          {fields.map((day, index) => (
            <div
              key={day.id}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Day {index + 1}
                </p>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
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

        <Button type="submit" disabled={submitting} className="min-h-11">
          {submitting
            ? "Saving..."
            : mode === "create"
              ? "Submit for approval"
              : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
