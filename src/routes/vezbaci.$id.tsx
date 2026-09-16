import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  fetchExercises,
  fetchProfile,
  fetchWorkoutsForUser,
  formatDate,
  volumeOf,
  type Exercise,
  type Profile,
  type Workout,
} from "@/lib/trenlog-store";

export const Route = createFileRoute("/vezbaci/$id")({
  head: () => ({
    meta: [
      { title: "Treninzi vežbača — TrenLog" },
      { name: "description", content: "Detaljan spisak treninga izabranog vežbača." },
      { property: "og:title", content: "Treninzi vežbača — TrenLog" },
      { property: "og:description", content: "Detaljan spisak treninga izabranog vežbača." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <UserDetail />
    </AppShell>
  ),
});

function UserDetail() {
  const { id } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Učitava profil izabranog vežbača i njegove treninge
  useEffect(() => {
    let active = true;
    void (async () => {
      const [p, w, e] = await Promise.all([
        fetchProfile(id),
        fetchWorkoutsForUser(id),
        fetchExercises(),
      ]);
      if (!active) return;
      setProfile(p);
      setWorkouts(w);
      setExercises(e);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const total = (workouts ?? []).reduce((s, w) => s + volumeOf(w), 0);

  return (
    <div className="space-y-5">
      <Link
        to="/vezbaci"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Svi vežbači
      </Link>

      <div>
        <h1 className="text-3xl font-black tracking-tight">{profile?.name ?? "Vežbač"}</h1>
        {profile?.username && (
          <p className="text-sm text-primary">@{profile.username}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {workouts?.length ?? 0} treninga · {Math.round(total).toLocaleString("sr-RS")} kg ukupnog
          volumena
        </p>
      </div>

      {workouts === null && <p className="text-sm text-muted-foreground">Učitavanje…</p>}

      {workouts?.length === 0 && (
        <div className="surface-card p-8 text-center text-sm text-muted-foreground">
          Ovaj vežbač još nema evidentiranih treninga.
        </div>
      )}

      {workouts?.map((w) => {
        const exIds = Array.from(new Set(w.sets.map((s) => s.exercise_id)));
        return (
          <div key={w.id} className="surface-card p-5">
            <h2 className="truncate text-lg font-bold">{w.workout_name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(w.date)} · {w.duration_minutes} min · {w.sets.length} serija ·{" "}
              {Math.round(volumeOf(w)).toLocaleString("sr-RS")} kg
            </p>
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
          </div>
        );
      })}
    </div>
  );
}
