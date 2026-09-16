import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
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
import { useTrenLog, volumeOf } from "@/lib/trenlog-store";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil i statistika — TrenLog" },
      { name: "description", content: "Grafikoni napretka snage i podešavanja profila." },
      { property: "og:title", content: "Profil i statistika — TrenLog" },
      { property: "og:description", content: "Grafikoni napretka snage i podešavanja profila." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Profile />
    </AppShell>
  ),
});

function Profile() {
  const { user, workouts, exercises, updateProfile } = useTrenLog();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [username, setUsername] = useState(user?.username ?? "");

  // Kada se profil učita iz baze, popuni polja
  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email ?? "");
    setUsername(user.username ?? "");
  }, [user]);

  const usedExercises = useMemo(() => {
    const ids = new Set(workouts.flatMap((w) => w.sets.map((s) => s.exercise_id)));
    return exercises.filter((e) => ids.has(e.id));
  }, [workouts, exercises]);

  const [exId, setExId] = useState(usedExercises[0]?.id ?? "");
  const activeId = exId || usedExercises[0]?.id || "";

  const progress = useMemo(() => {
    return [...workouts]
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .map((w) => {
        const sets = w.sets.filter((s) => s.exercise_id === activeId);
        if (!sets.length) return null;
        return {
          datum: new Date(w.date).toLocaleDateString("sr-RS", {
            day: "2-digit",
            month: "2-digit",
          }),
          max: Math.max(...sets.map((s) => s.weight_kg)),
        };
      })
      .filter(Boolean) as Array<{ datum: string; max: number }>;
  }, [workouts, activeId]);

  const volumeSeries = useMemo(
    () =>
      [...workouts]
        .sort((a, b) => +new Date(a.date) - +new Date(b.date))
        .map((w) => ({
          datum: new Date(w.date).toLocaleDateString("sr-RS", {
            day: "2-digit",
            month: "2-digit",
          }),
          volumen: Math.round(volumeOf(w)),
        })),
    [workouts],
  );

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black tracking-tight">Profil i statistika</h1>

      <div className="surface-card p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate text-lg font-bold">Napredak po vežbi</h2>
          <div className="w-40 shrink-0 sm:w-56">
            <Select value={activeId} onValueChange={setExId}>
              <SelectTrigger>
                <SelectValue placeholder="Vežba" />
              </SelectTrigger>
              <SelectContent>
                {usedExercises.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 h-64">
          {progress.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="datum" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} unit=" kg" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="max"
                  name="Maks. težina"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="pt-10 text-center text-sm text-muted-foreground">
              Potrebna su bar dva treninga sa ovom vežbom za grafikon.
            </p>
          )}
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-lg font-bold">Volumen po treningu</h2>
        <div className="mt-4 h-56">
          {volumeSeries.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeSeries} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="datum" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volumen"
                  name="Volumen (kg)"
                  stroke="var(--color-cyan)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="pt-10 text-center text-sm text-muted-foreground">
              Unesi još treninga da vidiš trend volumena.
            </p>
          )}
        </div>
      </div>

      <div className="surface-card space-y-4 p-5">
        <h2 className="text-lg font-bold">Podešavanja profila</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pname">Ime i prezime</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pemail">Email</Label>
            <Input id="pemail" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pusername">Korisničko ime</Label>
            <Input
              id="pusername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <Button
          className="rounded-full font-bold"
          onClick={() => {
            void updateProfile(name.trim(), email.trim(), username.trim()).then((error) =>
              error ? toast.error(error) : toast.success("Profil sačuvan."),
            );
          }}
        >
          Sačuvaj izmene
        </Button>
      </div>
    </div>
  );
}
