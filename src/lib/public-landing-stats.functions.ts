import { createServerFn } from "@tanstack/react-start";

export type PublicLandingStats = {
  publicAthletes: number;
  publicWorkouts: number;
  averageDurationMinutes: number | null;
};

// The homepage exposes only aggregate totals. It never returns profile or workout rows,
// so private users' individual data remains hidden while contributing to the totals.
export const getPublicLandingStats = createServerFn({ method: "GET" }).handler(async () => {
  // Load the service-role client only inside the server handler. Never include
  // server credentials in the client bundle.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("get_public_landing_stats");

  if (error) {
    throw new Error("Could not load landing statistics.");
  }

  const stats = data?.[0];
  return {
    publicAthletes: Number(stats?.public_athletes ?? 0),
    publicWorkouts: Number(stats?.public_workouts ?? 0),
    averageDurationMinutes:
      stats?.average_duration_minutes == null ? null : Number(stats.average_duration_minutes),
  } satisfies PublicLandingStats;
});
