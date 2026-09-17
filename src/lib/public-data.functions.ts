import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Javni pregled vežbača i njihovih treninga.
// Baza je zaključana tako da svako direktno vidi samo svoje zapise, pa se
// pregled tuđih podataka radi ovde — samo za prijavljene korisnike i samo sa
// bezbednim poljima (email adrese se nikada ne vraćaju).

export type PublicProfileRow = {
  id: string;
  name: string;
  username: string;
  created_at: string;
};

export const listPublicProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id, name, username, created_at")
      .order("created_at", { ascending: true });
    return (data ?? []) as PublicProfileRow[];
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("id, name, username, created_at")
      .eq("id", data.id)
      .maybeSingle();
    return (row as PublicProfileRow) ?? null;
  });

export const listPublicExercises = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("exercises")
      .select("id, user_id, name, category, is_custom")
      .order("is_custom", { ascending: true })
      .order("name", { ascending: true });
    return data ?? [];
  });

export const listPublicWorkouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("workouts")
      .select("id, user_id, workout_name, date, duration_minutes")
      .eq("user_id", data.userId)
      .order("date", { ascending: false });

    if (!rows || rows.length === 0) return { workouts: [], sets: [] };

    const { data: sets } = await supabaseAdmin
      .from("workout_sets")
      .select("id, workout_id, exercise_id, set_number, weight_kg, reps")
      .in(
        "workout_id",
        rows.map((r) => r.id),
      );

    return { workouts: rows, sets: sets ?? [] };
  });
