-- Return only aggregate statistics for profiles that have opted into public visibility.
-- No individual profile or workout data is exposed by this function.
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
    (SELECT count(*) FROM public.profiles p WHERE p.workouts_public = true),
    (SELECT count(*)
       FROM public.workouts w
       JOIN public.profiles p ON p.id = w.user_id
      WHERE p.workouts_public = true),
    (SELECT round(avg(w.duration_minutes))
       FROM public.workouts w
       JOIN public.profiles p ON p.id = w.user_id
      WHERE p.workouts_public = true);
$$;

REVOKE ALL ON FUNCTION public.get_public_landing_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_landing_stats() TO service_role;
