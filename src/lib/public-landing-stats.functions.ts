import { createServerFn } from "@tanstack/react-start";

export type PublicLandingStats = {
  publicAthletes: number;
  publicWorkouts: number;
  averageDurationMinutes: number | null;
};

// The homepage is public, so its aggregate statistics only include athletes
// who have chosen to make their profiles public. No profile or workout rows
// are returned to the browser.
export const getPublicLandingStats = createServerFn({ method: "GET" }).handler(async () => {
  // Load the service-role client only inside the server handler. Never include
  // server credentials in the client bundle.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("get_public_landing_stats");

  if (error) {
    throw new Error("Could not load public landing statistics.");
  }

  const stats = data?.[0];
  return {
    publicAthletes: Number(stats?.public_athletes ?? 0),
    publicWorkouts: Number(stats?.public_workouts ?? 0),
    averageDurationMinutes:
      stats?.average_duration_minutes == null ? null : Number(stats.average_duration_minutes),
  } satisfies PublicLandingStats;
});
