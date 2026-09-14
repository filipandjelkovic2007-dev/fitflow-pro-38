import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

const PRESETS = [60, 90, 120];

export function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const pct = duration ? ((duration - left) / duration) * 100 : 0;

  return (
    <div className="surface-card p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold">
          <Timer className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate">Pauza između serija</span>
        </h2>
        <div className="flex shrink-0 gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setDuration(p);
                setLeft(p);
                setRunning(false);
              }}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                duration === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {p}s
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center font-mono text-5xl font-black tabular-nums text-primary">
        {mm}:{ss}
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          className="flex-1 rounded-full font-bold"
          onClick={() => {
            if (left === 0) setLeft(duration);
            setRunning((r) => !r);
          }}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pauziraj" : "Pokreni"}
        </Button>
        <Button
          variant="secondary"
          className="rounded-full"
          onClick={() => {
            setRunning(false);
            setLeft(duration);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
