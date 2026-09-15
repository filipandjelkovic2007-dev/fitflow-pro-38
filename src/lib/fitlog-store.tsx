import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";

// ——— Tipovi podataka (odgovaraju tabelama u bazi) ———

export type Exercise = {
  id: string;
  user_id: string | null;
  name: string;
  category: string;
  is_custom: boolean;
};

export type WorkoutSet = {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
};

export type Workout = {
  id: string;
  user_id: string;
  workout_name: string;
  date: string; // ISO datum
  duration_minutes: number;
  sets: WorkoutSet[];
};

export type Profile = {
  id: string;
  name: string;
  email: string | null;
  username: string;
  created_at: string;
};

// Novi trening koji se šalje u bazu (bez id-jeva koje generiše baza)
export type NewWorkout = {
  workout_name: string;
  date: string;
  duration_minutes: number;
  sets: Array<{ exercise_id: string; set_number: number; weight_kg: number; reps: number }>;
};

type Ctx = {
  user: Profile | null;
  exercises: Exercise[];
  workouts: Workout[];
  ready: boolean;
  register: (email: string, password: string, name: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<string | null>;
  addExercise: (name: string, category: string) => Promise<Exercise | null>;
  addWorkout: (w: NewWorkout) => Promise<string | null>;
  deleteWorkout: (id: string) => Promise<string | null>;
  refresh: () => Promise<void>;
};

const TrenLogContext = createContext<Ctx | null>(null);

// Spaja treninge sa pripadajućim serijama u jedan objekat
function mergeWorkouts(
  rows: Array<{
    id: string;
    user_id: string;
    workout_name: string;
    date: string;
    duration_minutes: number;
  }>,
  sets: WorkoutSet[],
): Workout[] {
  return rows.map((w) => ({
    ...w,
    sets: sets.filter((s) => s.workout_id === w.id).sort((a, b) => a.set_number - b.set_number),
  }));
}

// Učitava treninge (sa serijama) za zadatog korisnika — koristi se i za tuđi profil
export async function fetchWorkoutsForUser(userId: string): Promise<Workout[]> {
  const { data: rows, error } = await supabase
    .from("workouts")
    .select("id, user_id, workout_name, date, duration_minutes")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error || !rows || rows.length === 0) return [];

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("id, workout_id, exercise_id, set_number, weight_kg, reps")
    .in(
      "workout_id",
      rows.map((r) => r.id),
    );

  return mergeWorkouts(rows, (sets ?? []) as WorkoutSet[]);
}

// Učitava spisak svih vežbača (profila)
export async function fetchProfiles(): Promise<Profile[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, name, email, username, created_at")
    .order("created_at", { ascending: true });
  return (data ?? []) as Profile[];
}

// Učitava jedan profil po id-u
export async function fetchProfile(id: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, name, email, username, created_at")
    .eq("id", id)
    .maybeSingle();
  return (data as Profile) ?? null;
}

// Učitava sve vežbe (predefinisane + sopstvene)
export async function fetchExercises(): Promise<Exercise[]> {
  const { data } = await supabase
    .from("exercises")
    .select("id, user_id, name, category, is_custom")
    .order("is_custom", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as Exercise[];
}

export function TrenLogProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [ready, setReady] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // Učitava sve podatke prijavljenog korisnika iz baze
  const loadAll = useCallback(async (userId: string) => {
    const [profile, exs, wks] = await Promise.all([
      fetchProfile(userId),
      fetchExercises(),
      fetchWorkoutsForUser(userId),
    ]);
    setUser(profile);
    setExercises(exs);
    setWorkouts(wks);
  }, []);

  // Prati stanje prijave (sesiju) i puni podatke
  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null;
      if (id === userIdRef.current) return;
      userIdRef.current = id;
      if (!id) {
        setUser(null);
        setWorkouts([]);
        setExercises([]);
        return;
      }
      // Supabase preporučuje da se pozivi ka bazi rade van callback-a
      setTimeout(() => {
        if (active) void loadAll(id);
      }, 0);
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user?.id ?? null;
      userIdRef.current = id;
      if (id) await loadAll(id);
      if (active) setReady(true);
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadAll]);

  const refresh = useCallback(async () => {
    if (userIdRef.current) await loadAll(userIdRef.current);
  }, [loadAll]);

  // Registracija novog korisnika (profil kreira okidač u bazi)
  const register = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name },
      },
    });
    if (error) return error.message;
    if (!data.session) return "Proveri email i potvrdi nalog pre prijave.";
    return null;
  }, []);

  // Prijava postojećeg korisnika
  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  // Odjava korisnika
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    userIdRef.current = null;
    setUser(null);
    setWorkouts([]);
    setExercises([]);
  }, []);

  // Izmena podataka profila
  const updateProfile = useCallback(async (name: string, email: string) => {
    const id = userIdRef.current;
    if (!id) return "Nisi prijavljen.";
    const { data, error } = await supabase
      .from("profiles")
      .update({ name, email })
      .eq("id", id)
      .select("id, name, email, username, created_at")
      .maybeSingle();
    if (error) return error.message;
    if (data) setUser(data as Profile);
    return null;
  }, []);

  // Dodavanje sopstvene vežbe
  const addExercise = useCallback(async (name: string, category: string) => {
    const id = userIdRef.current;
    if (!id) return null;
    const { data, error } = await supabase
      .from("exercises")
      .insert({ name, category, is_custom: true, user_id: id })
      .select("id, user_id, name, category, is_custom")
      .maybeSingle();
    if (error || !data) return null;
    const ex = data as Exercise;
    setExercises((prev) => [...prev, ex]);
    return ex;
  }, []);

  // Čuvanje treninga i njegovih serija u bazi
  const addWorkout = useCallback(async (w: NewWorkout) => {
    const id = userIdRef.current;
    if (!id) return "Nisi prijavljen.";

    const { data: created, error } = await supabase
      .from("workouts")
      .insert({
        user_id: id,
        workout_name: w.workout_name,
        date: w.date,
        duration_minutes: w.duration_minutes,
      })
      .select("id, user_id, workout_name, date, duration_minutes")
      .maybeSingle();
    if (error || !created) return error?.message ?? "Greška pri čuvanju treninga.";

    const { data: savedSets, error: setsError } = await supabase
      .from("workout_sets")
      .insert(w.sets.map((s) => ({ ...s, workout_id: created.id })))
      .select("id, workout_id, exercise_id, set_number, weight_kg, reps");
    if (setsError) {
      // Ako serije ne mogu da se sačuvaju, brišemo i sam trening da ne ostane prazan
      await supabase.from("workouts").delete().eq("id", created.id);
      return setsError.message;
    }

    setWorkouts((prev) => [
      { ...created, sets: (savedSets ?? []) as WorkoutSet[] },
      ...prev,
    ]);
    return null;
  }, []);

  // Brisanje treninga (serije se brišu kaskadno)
  const deleteWorkout = useCallback(async (id: string) => {
    const { error } = await supabase.from("workouts").delete().eq("id", id);
    if (error) return error.message;
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    return null;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      exercises,
      workouts,
      ready,
      register,
      login,
      logout,
      updateProfile,
      addExercise,
      addWorkout,
      deleteWorkout,
      refresh,
    }),
    [
      user,
      exercises,
      workouts,
      ready,
      register,
      login,
      logout,
      updateProfile,
      addExercise,
      addWorkout,
      deleteWorkout,
      refresh,
    ],
  );

  return <TrenLogContext.Provider value={value}>{children}</TrenLogContext.Provider>;
}

export function useTrenLog() {
  const ctx = useContext(TrenLogContext);
  if (!ctx) throw new Error("useTrenLog mora da se koristi unutar TrenLogProvider-a");
  return ctx;
}

// Ukupan volumen treninga (težina × ponavljanja)
export const volumeOf = (w: Workout) =>
  w.sets.reduce((sum, s) => sum + Number(s.weight_kg) * s.reps, 0);

// Prikaz datuma na srpskom
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
