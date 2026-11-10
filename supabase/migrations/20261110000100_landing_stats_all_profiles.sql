-- Return aggregate-only statistics for all profiles, including private profiles.
-- No individual profile or workout rows are exposed by this function.
CREATE OR REPLACE FUNCTION public.get_public_landing_stats()
RETURNS TABLE (
  public_athletes bigint,
  public_workouts bigint,
  average_duration_minutes numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.workouts),
    (SELECT round(avg(w.duration_minutes)) FROM public.workouts);
$$;

REVOKE ALL ON FUNCTION public.get_public_landing_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_landing_stats() TO service_role;
