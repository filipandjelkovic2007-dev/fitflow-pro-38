import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Exercise = {
  id: string;
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
  date: string; // ISO
  duration_minutes: number;
  sets: WorkoutSet[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: "ex-squat", name: "Čučanj", category: "Noge", is_custom: false },
  { id: "ex-bench", name: "Benč pres", category: "Grudi", is_custom: false },
  { id: "ex-deadlift", name: "Mrtvo dizanje", category: "Leđa", is_custom: false },
  { id: "ex-ohp", name: "Vojnički potisak", category: "Ramena", is_custom: false },
  { id: "ex-row", name: "Veslanje šipkom", category: "Leđa", is_custom: false },
  { id: "ex-pullup", name: "Zgib", category: "Leđa", is_custom: false },
  { id: "ex-curl", name: "Pregib s bučicama", category: "Biceps", is_custom: false },
  { id: "ex-legpress", name: "Potisak nogama", category: "Noge", is_custom: false },
  { id: "ex-lat", name: "Lat mašina", category: "Leđa", is_custom: false },
  { id: "ex-triceps", name: "Triceps ekstenzija", category: "Triceps", is_custom: false },
];

const uid = () => Math.random().toString(36).slice(2, 10);

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(18, 30, 0, 0);
  return d.toISOString();
}

function makeSets(
  workoutId: string,
  spec: Array<{ exercise_id: string; sets: Array<[number, number]> }>,
): WorkoutSet[] {
  const out: WorkoutSet[] = [];
  for (const item of spec) {
    item.sets.forEach(([weight, reps], i) => {
      out.push({
        id: uid(),
        workout_id: workoutId,
        exercise_id: item.exercise_id,
        set_number: i + 1,
        weight_kg: weight,
        reps,
      });
    });
  }
  return out;
}

function seedWorkouts(userId: string): Workout[] {
  const plan: Array<{ name: string; days: number; dur: number; squat: number; bench: number }> = [
    { name: "Trening A - Noge", days: 28, dur: 62, squat: 80, bench: 55 },
    { name: "Trening B - Grudi", days: 24, dur: 55, squat: 82.5, bench: 57.5 },
    { name: "Trening A - Noge", days: 19, dur: 64, squat: 85, bench: 60 },
    { name: "Trening B - Grudi", days: 14, dur: 58, squat: 87.5, bench: 62.5 },
    { name: "Trening A - Noge", days: 9, dur: 66, squat: 92.5, bench: 65 },
    { name: "Trening B - Grudi", days: 4, dur: 61, squat: 95, bench: 67.5 },
    { name: "Trening A - Noge", days: 1, dur: 70, squat: 100, bench: 70 },
  ];

  return plan.map((p) => {
    const id = uid();
    return {
      id,
      user_id: userId,
      workout_name: p.name,
      date: daysAgo(p.days),
      duration_minutes: p.dur,
      sets: makeSets(id, [
        {
          exercise_id: "ex-squat",
          sets: [
            [p.squat - 10, 8],
            [p.squat, 6],
            [p.squat, 5],
          ],
        },
        {
          exercise_id: "ex-bench",
          sets: [
            [p.bench - 5, 10],
            [p.bench, 8],
            [p.bench, 6],
          ],
        },
        {
          exercise_id: "ex-row",
          sets: [
            [50, 10],
            [55, 8],
          ],
        },
      ]),
    };
  });
}

type State = {
  user: User | null;
  exercises: Exercise[];
  workouts: Workout[];
};

type Ctx = State & {
  ready: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateProfile: (name: string, email: string) => void;
  addExercise: (name: string, category: string) => Exercise;
  addWorkout: (w: Omit<Workout, "id" | "user_id">) => void;
  deleteWorkout: (id: string) => void;
};

const FitLogContext = createContext<Ctx | null>(null);
const KEY = "fitlog:v1";

export function FitLogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    user: null,
    exercises: DEFAULT_EXERCISES,
    workouts: [],
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as State);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const login = useCallback((email: string, name?: string) => {
    setState((prev) => {
      if (prev.user) return { ...prev, user: { ...prev.user, email } };
      const user: User = {
        id: uid(),
        name: name?.trim() || email.split("@")[0],
        email,
        created_at: new Date().toISOString(),
      };
      return {
        user,
        exercises: prev.exercises.length ? prev.exercises : DEFAULT_EXERCISES,
        workouts: prev.workouts.length ? prev.workouts : seedWorkouts(user.id),
      };
    });
  }, []);

  const logout = useCallback(() => setState((p) => ({ ...p, user: null })), []);

  const updateProfile = useCallback((name: string, email: string) => {
    setState((p) => (p.user ? { ...p, user: { ...p.user, name, email } } : p));
  }, []);

  const addExercise = useCallback((name: string, category: string) => {
    const ex: Exercise = { id: uid(), name, category, is_custom: true };
    setState((p) => ({ ...p, exercises: [...p.exercises, ex] }));
    return ex;
  }, []);

  const addWorkout = useCallback((w: Omit<Workout, "id" | "user_id">) => {
    setState((p) => {
      if (!p.user) return p;
      const id = uid();
      return {
        ...p,
        workouts: [
          ...p.workouts,
          {
            ...w,
            id,
            user_id: p.user.id,
            sets: w.sets.map((s) => ({ ...s, workout_id: id })),
          },
        ],
      };
    });
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setState((p) => ({ ...p, workouts: p.workouts.filter((w) => w.id !== id) }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      login,
      logout,
      updateProfile,
      addExercise,
      addWorkout,
      deleteWorkout,
    }),
    [state, ready, login, logout, updateProfile, addExercise, addWorkout, deleteWorkout],
  );

  return <FitLogContext.Provider value={value}>{children}</FitLogContext.Provider>;
}

export function useFitLog() {
  const ctx = useContext(FitLogContext);
  if (!ctx) throw new Error("useFitLog must be used inside FitLogProvider");
  return ctx;
}

export const volumeOf = (w: Workout) =>
  w.sets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
