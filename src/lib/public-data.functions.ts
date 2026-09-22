import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Pregled vežbača i njihovih treninga.
// Koristi se klijent prijavljenog korisnika (context.supabase), pa pravila
// pristupa u bazi stvarno važe: svoje uvek, tuđe samo kada je vežbač javan.
// Email adrese se nikada ne čitaju.

export type PublicProfileRow = {
  id: string;
  name: string;
  username: string;
  created_at: string;
};

export const listPublicProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("id, name, username, created_at")
      .order("created_at", { ascending: true });
    return (data ?? []) as PublicProfileRow[];
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("profiles")
      .select("id, name, username, created_at")
      .eq("id", data.id)
      .maybeSingle();
    return (row as PublicProfileRow) ?? null;
  });

export const listPublicExercises = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("exercises")
      .select("id, user_id, name, category, is_custom")
      .order("is_custom", { ascending: true })
      .order("name", { ascending: true });
    return data ?? [];
  });

export const listPublicWorkouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("workouts")
      .select("id, user_id, workout_name, date, duration_minutes")
      .eq("user_id", data.userId)
      .order("date", { ascending: false });

    if (!rows || rows.length === 0) return { workouts: [], sets: [] };

    const { data: sets } = await context.supabase
      .from("workout_sets")
      .select("id, workout_id, exercise_id, set_number, weight_kg, reps")
      .in(
        "workout_id",
        rows.map((r) => r.id),
      );

    return { workouts: rows, sets: sets ?? [] };
  });
