"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { X } from "lucide-react";

import { TRIP_CATEGORIES } from "@/lib/trip-categories";
import { walkingIntensityValues, mealsPlanValues } from "@/lib/validations/vendor";
import { useUploadVendorImage } from "@/hooks/use-upload-vendor-image";
import { useCreateDestination } from "@/hooks/use-create-destination";
import { useSaveVendorTrip } from "@/hooks/use-save-vendor-trip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
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
  redirectTo = "/vendor/dashboard",
}: {
  mode: "create" | "edit";
  tripId?: string;
  destinations: { id: string; name: string }[];
  defaultValues?: TripFormDefaultValues;
  redirectTo?: string;
}) {
  const router = useRouter();
  const uploadImage = useUploadVendorImage();
  const createDestination = useCreateDestination();
  const saveTrip = useSaveVendorTrip();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [destinationList, setDestinationList] = useState(destinations);
  const [addingDestination, setAddingDestination] = useState(false);
  const [newDestinationName, setNewDestinationName] = useState("");

  const form = useForm<TripFormDefaultValues>({
    defaultValues: defaultValues ?? emptyDefaults,
  });

  async function handleAddDestination() {
    const name = newDestinationName.trim();
    if (!name) return;
    try {
      const destination = await createDestination.mutateAsync(name);
      setDestinationList((prev) => [...prev, destination]);
      form.setValue("destinationId", destination.id, { shouldDirty: true });
      setNewDestinationName("");
      setAddingDestination(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add destination.");
    }
  }

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

    for (const file of files) {
      try {
        const { url } = await uploadImage.mutateAsync(file);
        setImages((prev) => [...prev, url]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not upload image.");
      }
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(values: TripFormDefaultValues) {
    saveTrip.mutate(
      { mode, tripId, values: { ...values, images } },
      {
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save trip."),
        onSuccess: () => {
          toast.success(mode === "create" ? "Trip submitted for MITRAM approval." : "Trip updated.");
          router.push(redirectTo);
          router.refresh();
        },
      },
    );
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
                {addingDestination ? (
                  <div className="flex gap-2">
                    <Input
                      autoFocus
                      placeholder="e.g. Coorg, Karnataka"
                      value={newDestinationName}
                      onChange={(e) => setNewDestinationName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDestination();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={createDestination.isPending}
                      onClick={handleAddDestination}
                    >
                      {createDestination.isPending ? "Adding..." : "Add"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setAddingDestination(false);
                        setNewDestinationName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <Select
                      items={destinationList.map((d) => ({ value: d.id, label: d.name }))}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {destinationList.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => setAddingDestination(true)}
                      className="text-left text-sm font-medium text-primary hover:underline"
                    >
                      Don&rsquo;t see your destination? Add a new one
                    </button>
                  </>
                )}
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
                Just the place names, separated by commas. We&rsquo;ll add the arrows for you.
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
              disabled={uploadImage.isPending}
              className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {uploadImage.isPending ? "Uploading..." : "+ Add photo"}
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

        <Card>
        <CardContent className="space-y-4">
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
                <FieldLabel key={meal} htmlFor={`meal-${meal}`}>
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`meal-${meal}`}
                      checked={mealsPlan.includes(meal)}
                      onCheckedChange={() => toggleMeal(meal)}
                    />
                    <FieldTitle className="font-normal capitalize">{meal}</FieldTitle>
                  </Field>
                </FieldLabel>
              ))}
            </div>
          </FormItem>

          <Field orientation="horizontal" className="justify-between">
            <FieldLabel htmlFor="insurance-included-switch">Insurance included</FieldLabel>
            <FormField
              control={form.control}
              name="insuranceIncluded"
              render={({ field }) => (
                <Switch id="insurance-included-switch" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </Field>
          <Field orientation="horizontal" className="justify-between">
            <FieldLabel htmlFor="coordinator-included-switch">MITRAM coordinator included</FieldLabel>
            <FormField
              control={form.control}
              name="coordinatorIncluded"
              render={({ field }) => (
                <Switch id="coordinator-included-switch" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </Field>

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
        </CardContent>
        </Card>

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

        <Button type="submit" disabled={saveTrip.isPending} className="min-h-11">
          {saveTrip.isPending
            ? "Saving..."
            : mode === "create"
              ? "Submit for approval"
              : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
