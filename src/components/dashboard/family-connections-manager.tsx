"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  type FamilyConnection,
  useAddFamilyConnection,
  useUpdateFamilyConnection,
  useRemoveFamilyConnection,
} from "@/hooks/use-family-connections";

type Connection = FamilyConnection;

const PERMISSION_FIELDS: { key: keyof Connection; label: string }[] = [
  { key: "tripUpdates", label: "Trip updates" },
  { key: "arrivalUpdates", label: "Arrival updates" },
  { key: "photos", label: "Photos" },
  { key: "liveLocation", label: "Live location" },
  { key: "emergencyNotifications", label: "Emergency notifications" },
];

const emptyForm = { name: "", relationship: "", email: "", phone: "" };

export function FamilyConnectionsManager({ initialConnections }: { initialConnections: Connection[] }) {
  const [connections, setConnections] = useState(initialConnections);
  const [form, setForm] = useState(emptyForm);
  const addConnection = useAddFamilyConnection();
  const updateConnection = useUpdateFamilyConnection();
  const removeConnection = useRemoveFamilyConnection();

  function handleAdd() {
    if (!form.name.trim() || !form.relationship.trim()) {
      toast.error("Enter a name and relationship.");
      return;
    }
    addConnection.mutate(
      {
        name: form.name,
        relationship: form.relationship,
        email: form.email,
        phone: form.phone,
        tripUpdates: true,
        arrivalUpdates: true,
        photos: true,
        liveLocation: false,
        emergencyNotifications: true,
      },
      {
        onSuccess: (created) => {
          setConnections((prev) => [created, ...prev]);
          setForm(emptyForm);
          toast.success("Family connection added.");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add family connection."),
      },
    );
  }

  function togglePermission(id: string, key: keyof Connection, value: boolean) {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    updateConnection.mutate(
      { id, [key]: value },
      {
        onError: () => {
          toast.error("Could not update permission.");
          setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: !value } : c)));
        },
      },
    );
  }

  function handleRemove(id: string) {
    const prev = connections;
    setConnections((c) => c.filter((conn) => conn.id !== id));
    removeConnection.mutate(id, {
      onError: () => {
        toast.error("Could not remove family connection.");
        setConnections(prev);
      },
    });
  }

  return (
    <div className="space-y-6">
      {connections.length > 0 && (
        <ul className="space-y-4" role="list">
          {connections.map((c) => (
            <li key={c.id}>
              <Card>
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.relationship}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(c.id)}
                      aria-label={`Remove ${c.name}`}
                      className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5 border-t border-border pt-3">
                    {PERMISSION_FIELDS.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{label}</span>
                        <Switch
                          checked={c[key] as boolean}
                          onCheckedChange={(checked) => togglePermission(c.id, key, checked)}
                          aria-label={`${label} for ${c.name}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card className="border-dashed">
      <CardContent>
        <p className="text-sm font-semibold text-foreground">Add a family member</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            aria-label="Family member name"
          />
          <Input
            placeholder="Relationship (e.g. Son)"
            value={form.relationship}
            onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
            aria-label="Relationship"
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            aria-label="Email"
          />
          <Input
            type="tel"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            aria-label="Phone"
          />
        </div>
        <Button type="button" className="mt-3 w-full min-h-11" onClick={handleAdd} disabled={addConnection.isPending}>
          <Plus className="size-4" aria-hidden="true" />
          {addConnection.isPending ? "Adding..." : "Add family member"}
        </Button>
      </CardContent>
      </Card>
    </div>
  );
}
