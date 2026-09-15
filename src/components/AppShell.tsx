import { Link, useNavigate } from "@tanstack/react-router";
import { Dumbbell, History, LayoutDashboard, LogOut, Plus, User, Users } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { useFitLog } from "@/lib/fitlog-store";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Tabla", icon: LayoutDashboard },
  { to: "/trening", label: "Trening", icon: Plus },
  { to: "/istorija", label: "Istorija", icon: History },
  { to: "/vezbaci", label: "Vežbači", icon: Users },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useFitLog();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/prijava", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Učitavanje…
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Dumbbell className="h-5 w-5" />
            </span>
            <span className="truncate text-lg font-extrabold tracking-tight">FitLog</span>
          </Link>
          <div className="flex items-center gap-1">
            <nav className="mr-2 hidden items-center gap-1 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Odjava"
              onClick={() => {
                void logout().then(() => navigate({ to: "/", replace: true }));
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                activeProps={{ className: "text-primary" }}
                className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground"
              >
                <Icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
