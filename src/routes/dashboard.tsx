import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Dumbbell, Flame, Plus, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { formatDate, useTrenLog, volumeOf } from "@/lib/trenlog-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Kontrolna tabla — TrenLog" },
      { name: "description", content: "Brza statistika tvojih treninga i volumena." },
      { property: "og:title", content: "Kontrolna tabla — TrenLog" },
      { property: "og:description", content: "Brza statistika tvojih treninga i volumena." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

function Dashboard() {
  const { user, workouts, exercises } = useTrenLog();

  const sorted = [...workouts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const weekAgo = Date.now() - 7 * 86400000;
  const thisWeek = sorted.filter((w) => +new Date(w.date) >= weekAgo);
  const totalVolume = workouts.reduce((s, w) => s + volumeOf(w), 0);
  const last = sorted[0];

  const stats = [
    {
      icon: CalendarDays,
      label: "Treninga ove nedelje",
      value: String(thisWeek.length),
    },
    {
      icon: Flame,
      label: "Ukupan volumen",
      value: `${Math.round(totalVolume).toLocaleString("sr-RS")} kg`,
    },
    {
      icon: TrendingUp,
      label: "Ukupno treninga",
      value: String(workouts.length),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Zdravo, {user?.name}</p>
        <h1 className="text-3xl font-black tracking-tight">Spreman za danas?</h1>
      </div>

      <Link
        to="/trening"
        className="glow-neon flex items-center justify-between rounded-2xl bg-primary px-5 py-4 font-bold text-primary-foreground"
      >
        Započni novi trening
        <Plus className="h-5 w-5" />
      </Link>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="surface-card p-4">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-2xl font-black">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="surface-card p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate text-lg font-bold">Poslednji trening</h2>
          <Link to="/istorija" className="text-sm font-semibold text-primary">
            Istorija
          </Link>
        </div>
        {last ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-xl font-bold">{last.workout_name}</span>
              <span className="text-sm text-muted-foreground">{formatDate(last.date)}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge>{last.duration_minutes} min</Badge>
              <Badge>{last.sets.length} serija</Badge>
              <Badge>{Math.round(volumeOf(last)).toLocaleString("sr-RS")} kg volumen</Badge>
            </div>
            <ul className="divide-y divide-border/60 text-sm">
              {Array.from(new Set(last.sets.map((s) => s.exercise_id))).map((exId) => {
                const ex = exercises.find((e) => e.id === exId);
                const sets = last.sets.filter((s) => s.exercise_id === exId);
                return (
                  <li key={exId} className="flex items-center justify-between gap-3 py-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <Dumbbell className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{ex?.name ?? "Vežba"}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {sets.map((s) => `${s.weight_kg}×${s.reps}`).join("  ·  ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Još nema treninga. Započni prvi i pojaviće se ovde.
          </p>
        )}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-primary/40 px-3 py-1 font-semibold text-primary">
      {children}
    </span>
  );
}
