-- Zameni "propusna" pravila (USING true) stvarnim uslovima
DROP POLICY IF EXISTS "Prijavljeni vide sve profile" ON public.profiles;
CREATE POLICY "Korisnik vidi svoj profil" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Prijavljeni vide sve treninge" ON public.workouts;
CREATE POLICY "Korisnik vidi svoje treninge" ON public.workouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Prijavljeni vide sve serije" ON public.workout_sets;
CREATE POLICY "Korisnik vidi serije svojih treninga" ON public.workout_sets
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Vidljive predefinisane i sve sopstvene" ON public.exercises;
CREATE POLICY "Vidljive predefinisane i sopstvene vezbe" ON public.exercises
  FOR SELECT TO authenticated USING (is_custom = false OR auth.uid() = user_id);

-- Javni prikazi (bez osetljivih polja) za pregled drugih vežbača
CREATE OR REPLACE VIEW public.public_profiles
  WITH (security_invoker = false) AS
  SELECT id, name, username, created_at FROM public.profiles;

CREATE OR REPLACE VIEW public.public_workouts
  WITH (security_invoker = false) AS
  SELECT id, user_id, workout_name, date, duration_minutes FROM public.workouts;

CREATE OR REPLACE VIEW public.public_workout_sets
  WITH (security_invoker = false) AS
  SELECT id, workout_id, exercise_id, set_number, weight_kg, reps FROM public.workout_sets;

CREATE OR REPLACE VIEW public.public_exercises
  WITH (security_invoker = false) AS
  SELECT id, user_id, name, category, is_custom FROM public.exercises;

REVOKE ALL ON public.public_profiles, public.public_workouts, public.public_workout_sets, public.public_exercises FROM PUBLIC, anon;
GRANT SELECT ON public.public_profiles, public.public_workouts, public.public_workout_sets, public.public_exercises TO authenticated;
