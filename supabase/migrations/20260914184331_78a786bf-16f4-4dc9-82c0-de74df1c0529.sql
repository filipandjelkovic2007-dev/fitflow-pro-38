-- Profili vežbača (podaci o korisniku van auth šeme)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Vežbač',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prijavljeni vide sve profile" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Korisnik menja svoj profil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Korisnik kreira svoj profil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Vežbe: predefinisane (user_id IS NULL) i sopstvene
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Ostalo',
  is_custom BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vidljive predefinisane i sve sopstvene" ON public.exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Korisnik dodaje svoju vezbu" ON public.exercises FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_custom = true);
CREATE POLICY "Korisnik menja svoju vezbu" ON public.exercises FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Korisnik brise svoju vezbu" ON public.exercises FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Treninzi
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workouts TO authenticated;
GRANT ALL ON public.workouts TO service_role;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prijavljeni vide sve treninge" ON public.workouts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Korisnik dodaje svoj trening" ON public.workouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Korisnik menja svoj trening" ON public.workouts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Korisnik brise svoj trening" ON public.workouts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Serije unutar treninga
CREATE TABLE public.workout_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL DEFAULT 1,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sets TO authenticated;
GRANT ALL ON public.workout_sets TO service_role;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prijavljeni vide sve serije" ON public.workout_sets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Korisnik dodaje serije u svoj trening" ON public.workout_sets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid()));
CREATE POLICY "Korisnik menja serije u svom treningu" ON public.workout_sets FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid()));
CREATE POLICY "Korisnik brise serije iz svog treninga" ON public.workout_sets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid()));

CREATE INDEX idx_workouts_user ON public.workouts(user_id, date DESC);
CREATE INDEX idx_sets_workout ON public.workout_sets(workout_id);

-- Automatsko kreiranje profila pri registraciji
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'name', ''), split_part(NEW.email, '@', 1), 'Vežbač'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Predefinisane vežbe dostupne svim korisnicima
INSERT INTO public.exercises (name, category, is_custom, user_id) VALUES
  ('Čučanj', 'Noge', false, NULL),
  ('Benč pres', 'Grudi', false, NULL),
  ('Mrtvo dizanje', 'Leđa', false, NULL),
  ('Vojnički potisak', 'Ramena', false, NULL),
  ('Veslanje šipkom', 'Leđa', false, NULL),
  ('Zgib', 'Leđa', false, NULL),
  ('Pregib s bučicama', 'Biceps', false, NULL),
  ('Potisak nogama', 'Noge', false, NULL),
  ('Lat mašina', 'Leđa', false, NULL),
  ('Triceps ekstenzija', 'Triceps', false, NULL);