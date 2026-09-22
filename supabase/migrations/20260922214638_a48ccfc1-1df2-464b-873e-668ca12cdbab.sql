-- novi i postojeći nalozi su privatni po defaultu
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS workouts_public boolean NOT NULL DEFAULT false;

-- pomoćna funkcija (bez rekurzije u pravilima)
CREATE OR REPLACE FUNCTION public.is_profile_public(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p
                 WHERE p.id = _user_id AND p.workouts_public);
$$;
REVOKE EXECUTE ON FUNCTION public.is_profile_public(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_profile_public(uuid) TO authenticated;

DROP POLICY IF EXISTS "Korisnik vidi svoj profil" ON public.profiles;
CREATE POLICY "Vidljiv sopstveni i javni profil" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR workouts_public);

DROP POLICY IF EXISTS "Korisnik vidi svoje treninge" ON public.workouts;
CREATE POLICY "Vidljivi sopstveni i javni treninzi" ON public.workouts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_profile_public(user_id));

DROP POLICY IF EXISTS "Korisnik vidi serije svojih treninga" ON public.workout_sets;
CREATE POLICY "Vidljive serije vidljivih treninga" ON public.workout_sets
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workouts w
                 WHERE w.id = workout_sets.workout_id
                   AND (w.user_id = auth.uid() OR public.is_profile_public(w.user_id))));

DROP POLICY IF EXISTS "Vidljive predefinisane i sopstvene vezbe" ON public.exercises;
CREATE POLICY "Vidljive predefinisane, sopstvene i javne vezbe" ON public.exercises
  FOR SELECT TO authenticated
  USING (is_custom = false OR auth.uid() = user_id OR public.is_profile_public(user_id));

-- izmena: korisnik menja isključivo svoj red u profiles
DROP POLICY IF EXISTS "Korisnik menja svoj profil" ON public.profiles;
CREATE POLICY "Korisnik menja svoj profil" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- email je privatan na nivou baze: kolona se ne može čitati ni menjati iz aplikacije
REVOKE SELECT, UPDATE ON public.profiles FROM authenticated;
GRANT SELECT (id, name, username, created_at, workouts_public) ON public.profiles TO authenticated;
GRANT UPDATE (name, username, workouts_public) ON public.profiles TO authenticated;