"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { RoomCareValues } from "@/lib/validations/booking";

const roomTypes: { value: RoomCareValues["roomType"]; label: string }[] = [
  { value: "single", label: "Single occupancy" },
  { value: "twin", label: "Twin sharing" },
  { value: "triple", label: "Triple sharing" },
];

const careOptions = [
  "BP & sugar monitoring",
  "Wheelchair assist",
  "Dedicated companion",
  "Dietary accommodation",
];

export function StepRoomCare({
  value,
  onBack,
  onNext,
}: {
  value: RoomCareValues | null;
  onBack: () => void;
  onNext: (value: RoomCareValues) => void;
}) {
  const [roomType, setRoomType] = useState<RoomCareValues["roomType"]>(
    value?.roomType ?? "single"
  );
  const [careRequests, setCareRequests] = useState<string[]>(value?.specialCareRequests ?? []);
  const [travelDate, setTravelDate] = useState<Date | undefined>(value?.travelDate);
  const [calendarOpen, setCalendarOpen] = useState(false);

  function toggleCare(option: string) {
    setCareRequests((prev) =>
      prev.includes(option) ? prev.filter((c) => c !== option) : [...prev, option]
    );
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Room, care & travel date</h1>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Travel date
      </p>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 size-4" aria-hidden="true" />
              {travelDate
                ? travelDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Pick a date"}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={travelDate}
            onSelect={(date) => {
              setTravelDate(date);
              setCalendarOpen(false);
            }}
            disabled={{ before: new Date() }}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Room type
      </p>
      <div className="mt-2 space-y-2" role="radiogroup" aria-label="Room type">
        {roomTypes.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={roomType === opt.value}
            onClick={() => setRoomType(opt.value)}
            className={
              roomType === opt.value
                ? "block w-full rounded-lg border-2 border-primary bg-secondary/40 p-3 text-left text-sm font-semibold text-foreground"
                : "block w-full rounded-lg border border-border p-3 text-left text-sm text-foreground hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Special care requests
      </p>
      <div className="mt-2 space-y-2">
        {careOptions.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2.5 rounded-lg border border-border p-3 text-sm text-foreground"
          >
            <input
              type="checkbox"
              checked={careRequests.includes(option)}
              onChange={() => toggleCare(option)}
              className="size-4 accent-primary"
            />
            {option}
          </label>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={!travelDate}
          onClick={() =>
            travelDate &&
            onNext({ travelDate, roomType, specialCareRequests: careRequests })
          }
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
