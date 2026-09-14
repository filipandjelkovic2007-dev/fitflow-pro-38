import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { RestTimer } from "@/components/RestTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFitLog, type WorkoutSet } from "@/lib/fitlog-store";

export const Route = createFileRoute("/trening")({
  head: () => ({
    meta: [
      { title: "Novi trening — FitLog" },
      { name: "description", content: "Unesi vežbe, serije, kilažu i ponavljanja." },
      { property: "og:title", content: "Novi trening — FitLog" },
      { property: "og:description", content: "Unesi vežbe, serije, kilažu i ponavljanja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <NewWorkout />
    </AppShell>
  ),
});

type DraftSet = { weight: string; reps: string };
type DraftExercise = { key: string; exercise_id: string; sets: DraftSet[] };

const uid = () => Math.random().toString(36).slice(2, 10);

function NewWorkout() {
  const { exercises, addExercise, addWorkout } = useFitLog();
  const navigate = useNavigate();

  const [name, setName] = useState("Trening A");
  const [duration, setDuration] = useState("60");
  const [items, setItems] = useState<DraftExercise[]>([]);
  const [picked, setPicked] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCat, setCustomCat] = useState("");

  function addItem(exerciseId: string) {
    setItems((p) => [
      ...p,
      { key: uid(), exercise_id: exerciseId, sets: [{ weight: "", reps: "" }] },
    ]);
  }

  function updateSet(key: string, idx: number, field: keyof DraftSet, value: string) {
    setItems((p) =>
      p.map((it) =>
        it.key === key
          ? {
              ...it,
              sets: it.sets.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
            }
          : it,
      ),
    );
  }

  function save() {
    const sets: WorkoutSet[] = [];
    for (const it of items) {
      let n = 0;
      for (const s of it.sets) {
        const w = parseFloat(s.weight);
        const r = parseInt(s.reps, 10);
        if (!Number.isFinite(w) || !Number.isFinite(r) || r <= 0) continue;
        n += 1;
        sets.push({
          id: uid(),
          workout_id: "",
          exercise_id: it.exercise_id,
          set_number: n,
          weight_kg: w,
          reps: r,
        });
      }
    }
    if (sets.length === 0) {
      toast.error("Dodaj bar jednu seriju sa težinom i ponavljanjima.");
      return;
    }
    addWorkout({
      workout_name: name.trim() || "Trening",
      date: new Date().toISOString(),
      duration_minutes: parseInt(duration, 10) || 0,
      sets,
    });
    toast.success("Trening sačuvan!");
    navigate({ to: "/istorija" });
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black tracking-tight">Novi trening</h1>

      <div className="surface-card grid gap-4 p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="wname">Naziv treninga</Label>
          <Input id="wname" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wdur">Trajanje (min)</Label>
          <Input
            id="wdur"
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>

      <RestTimer />

      <div className="surface-card space-y-3 p-5">
        <h2 className="text-lg font-bold">Dodaj vežbu</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={picked} onValueChange={setPicked}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Izaberi vežbu" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name} · {e.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="rounded-full font-bold"
            onClick={() => {
              if (!picked) {
                toast.error("Prvo izaberi vežbu.");
                return;
              }
              addItem(picked);
            }}
          >
            <Plus className="h-4 w-4" /> Dodaj
          </Button>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row">
          <Input
            placeholder="Sopstvena vežba"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <Input
            placeholder="Kategorija"
            value={customCat}
            onChange={(e) => setCustomCat(e.target.value)}
          />
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => {
              if (!customName.trim()) return;
              const ex = addExercise(customName.trim(), customCat.trim() || "Ostalo");
              addItem(ex.id);
              setCustomName("");
              setCustomCat("");
              toast.success("Vežba kreirana i dodata.");
            }}
          >
            Kreiraj
          </Button>
        </div>
      </div>

      {items.map((it) => {
        const ex = exercises.find((e) => e.id === it.exercise_id);
        return (
          <div key={it.key} className="surface-card p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold">{ex?.name}</h3>
                <p className="text-xs text-muted-foreground">{ex?.category}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Ukloni vežbu"
                onClick={() => setItems((p) => p.filter((x) => x.key !== it.key))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {it.sets.map((s, i) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2">
                  <span className="text-sm font-bold text-muted-foreground">{i + 1}.</span>
                  <Input
                    inputMode="decimal"
                    placeholder="kg"
                    value={s.weight}
                    onChange={(e) => updateSet(it.key, i, "weight", e.target.value)}
                  />
                  <Input
                    inputMode="numeric"
                    placeholder="ponavljanja"
                    value={s.reps}
                    onChange={(e) => updateSet(it.key, i, "reps", e.target.value)}
                  />
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              className="mt-3 w-full rounded-full"
              onClick={() =>
                setItems((p) =>
                  p.map((x) =>
                    x.key === it.key
                      ? {
                          ...x,
                          sets: [...x.sets, { ...(x.sets.at(-1) ?? { weight: "", reps: "" }) }],
                        }
                      : x,
                  ),
                )
              }
            >
              <Plus className="h-4 w-4" /> Dodaj seriju
            </Button>
          </div>
        );
      })}

      <Button className="glow-neon w-full rounded-full py-6 text-base font-black" onClick={save}>
        <Check className="h-5 w-5" /> Sačuvaj trening
      </Button>
    </div>
  );
}
