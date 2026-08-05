"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const categories = [
  { value: "all", label: "All" },
  { value: "pilgrimage", label: "Pilgrimage" },
  { value: "heritage", label: "Heritage" },
  { value: "international", label: "International" },
];

export function FilterChips({
  active,
  onChange,
}: {
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <ToggleGroup
      aria-label="Filter trips by category"
      value={[active]}
      onValueChange={(value) => {
        if (value.length > 0) onChange(value[0]);
      }}
      className="flex-wrap"
    >
      {categories.map((c) => (
        <ToggleGroupItem key={c.value} value={c.value} className="rounded-full">
          {c.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
