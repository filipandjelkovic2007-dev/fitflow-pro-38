import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronDown, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, useTrenLog, volumeOf } from "@/lib/fitlog-store";

export const Route = createFileRoute("/istorija")({
  head: () => ({
    meta: [
      { title: "Istorija treninga — TrenLog" },
      { name: "description", content: "Hronološki pregled svih tvojih treninga." },
      { property: "og:title", content: "Istorija treninga — TrenLog" },
      { property: "og:description", content: "Hronološki pregled svih tvojih treninga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <HistoryPage />
    </AppShell>
  ),
});

function HistoryPage() {
  const { workouts, exercises, deleteWorkout } = useTrenLog();
  const [from, setFrom] = useState("");
  const [type, setType] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  const types = useMemo(
    () => Array.from(new Set(workouts.map((w) => w.workout_name))),
    [workouts],
  );

  const list = useMemo(
    () =>
      [...workouts]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .filter((w) => (from ? +new Date(w.date) >= +new Date(from) : true))
        .filter((w) => (type === "all" ? true : w.workout_name === type)),
    [workouts, from, type],
  );

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black tracking-tight">Istorija</h1>

      <div className="surface-card grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Od datuma</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Tip treninga</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi treninzi</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {list.length === 0 && (
        <div className="surface-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Nema treninga za izabrane filtere.</p>
          <Link to="/trening" className="mt-3 inline-block font-semibold text-primary">
            Započni novi trening
          </Link>
        </div>
      )}

      {list.map((w) => {
        const isOpen = open === w.id;
        const exIds = Array.from(new Set(w.sets.map((s) => s.exercise_id)));
        return (
          <div key={w.id} className="surface-card p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <button
                className="min-w-0 text-left"
                onClick={() => setOpen(isOpen ? null : w.id)}
                aria-expanded={isOpen}
              >
                <h2 className="truncate text-lg font-bold">{w.workout_name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(w.date)} · {w.duration_minutes} min · {w.sets.length} serija ·{" "}
                  {Math.round(volumeOf(w)).toLocaleString("sr-RS")} kg
                </p>
              </button>
              <div className="flex shrink-0 items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Detalji"
                  onClick={() => setOpen(isOpen ? null : w.id)}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Obriši trening"
                  onClick={() => {
                    void deleteWorkout(w.id).then((error) =>
                      error ? toast.error(error) : toast.success("Trening obrisan."),
                    );
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            {isOpen && (
              <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                {exIds.map((exId) => {
                  const ex = exercises.find((e) => e.id === exId);
                  const sets = w.sets.filter((s) => s.exercise_id === exId);
                  return (
                    <div key={exId}>
                      <p className="text-sm font-semibold">{ex?.name ?? "Vežba"}</p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {sets.map((s) => (
                          <span
                            key={s.id}
                            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                          >
                            {s.set_number}. {s.weight_kg} kg × {s.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
